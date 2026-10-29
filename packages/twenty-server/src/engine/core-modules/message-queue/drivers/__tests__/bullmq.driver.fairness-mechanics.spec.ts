import {
  buildLabels,
  createFairnessHarness,
  type FairnessHarness,
  silenceDriverLogs,
  ticketOf,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import {
  FAIR_REBASE_STEP,
  FAIR_REBASE_THRESHOLD,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';

describe('BullMQDriver fairness mechanics', () => {
  beforeAll(silenceDriverLogs);

  describe('S13: A enqueues a job with id sync-A twice, the second one is a duplicate, then A enqueues 1 job and B enqueues 2 jobs', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueue({ label: 'A1', workspaceId: 'A', id: 'sync-A' });
      await harness.enqueue({ label: 'A1', workspaceId: 'A', id: 'sync-A' });
      await harness.enqueue({ label: 'A2', workspaceId: 'A' });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 2 }),
        workspaceId: 'B',
      });
    };

    it('flag off: the duplicate is skipped, the rest is FIFO', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual(['A1', 'A2', 'B1', 'B2']);
    });

    it('flag on: the duplicate neither runs nor advances the clock of A', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(
        await harness.readClock({ groupKey: buildWorkspaceGroupKey('A') }),
      ).toBe(2);
      expect(await harness.processAll()).toEqual(['A1', 'B1', 'A2', 'B2']);
    });
  });

  describe('S14: A enqueues a job that fails once and is retried, B enqueues 2 jobs', () => {
    const enqueue = async (harness: FairnessHarness) => {
      harness.failNextAttempts({ label: 'R', count: 1 });
      await harness.enqueue({ label: 'R', workspaceId: 'A', retryLimit: 1 });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 2 }),
        workspaceId: 'B',
      });
    };

    it('flag off: the retry re-enters the FIFO behind the waiting jobs', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processNext(4)).toEqual(['R', 'B1', 'B2', 'R']);
    });

    it('flag on: the retry keeps its ticket, comes back as soon as its turn does, and leaves the clocks untouched', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processNext(4)).toEqual(['R', 'B1', 'R', 'B2']);
      expect(
        await harness.readClock({ groupKey: buildWorkspaceGroupKey('A') }),
      ).toBe(1);
      expect(await harness.readVirtualTime()).toBe(1);
    });
  });

  describe('S15: the virtual time reaches the rebase threshold while A and B have 3 jobs each waiting, then A enqueues 1 more job', () => {
    const enqueueAndProcessThree = async (harness: FairnessHarness) => {
      await harness.setVirtualTime({ value: FAIR_REBASE_THRESHOLD - 1 });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 3 }),
        workspaceId: 'A',
      });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 3 }),
        workspaceId: 'B',
      });

      const processed = await harness.processNext(3);

      await harness.enqueue({ label: 'A4', workspaceId: 'A' });

      return processed;
    };

    it('flag off: nothing to rebase, FIFO', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      expect(await enqueueAndProcessThree(harness)).toEqual(['A1', 'A2', 'A3']);
      expect(await harness.processAll()).toEqual(['B1', 'B2', 'B3', 'A4']);
    });

    it('flag on: the dispatch that crosses the threshold shifts the virtual time, the waiting tickets and the clocks by one step, the order is kept', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      expect(await enqueueAndProcessThree(harness)).toEqual(['A1', 'B1', 'A2']);
      expect(await harness.readVirtualTime()).toBe(
        FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP,
      );
      expect(harness.readPriority({ label: 'B2' })).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP),
      );
      expect(harness.readPriority({ label: 'A4' })).toBe(
        ticketOf(FAIR_REBASE_THRESHOLD + 2 - FAIR_REBASE_STEP),
      );
      expect(await harness.processAll()).toEqual(['B2', 'A3', 'B3', 'A4']);
    });
  });

  describe('S16: A has 3 ticketed jobs waiting when a cron scheduler fires', () => {
    const prepare = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 3 }),
        workspaceId: 'A',
      });
      await harness.scheduleCron({ label: 'CRON', every: 60_000 });
      await harness.fireCrons();
    };
    const expectedOrder = ['CRON', ...buildLabels({ prefix: 'A', count: 3 })];

    it('flag off: the cron instance has no priority, BullMQ serves it before every prioritized job', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await prepare(harness);

      expect(await harness.processAll()).toEqual(expectedOrder);
    });

    it('flag on: same order, cron instances carry no ticket and stay outside fairness', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await prepare(harness);

      expect(await harness.processAll()).toEqual(expectedOrder);
    });
  });
});
