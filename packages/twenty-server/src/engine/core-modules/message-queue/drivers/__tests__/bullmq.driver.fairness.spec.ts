import { ENQUEUE_JOB_PRIORITY } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-priority.constant';
import {
  buildLabels,
  createFairnessHarness,
  type FairnessHarness,
  silenceDriverLogs,
  ticketOf,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { buildApplicationGroupKey } from 'src/engine/core-modules/message-queue/utils/build-application-group-key.util';
import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { SERVER_ROUTE_DISPATCH_JOB_PRIORITY } from 'src/engine/core-modules/server-route-trigger/constants/server-route-dispatch-job-priority.constant';

describe('BullMQDriver fairness scenarios', () => {
  beforeAll(silenceDriverLogs);

  describe('S1: A enqueues a burst of 10 jobs, then B enqueues 1 job (group keys deduced from workspaceId)', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 10 }),
        workspaceId: 'A',
      });
      await harness.enqueue({ label: 'B1', workspaceId: 'B' });
    };

    it('flag off: B waits behind the whole burst of A', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'A', count: 10 }),
        'B1',
      ]);
    });

    it('flag on: B runs right after the first job of A', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'A1',
        'B1',
        ...buildLabels({ prefix: 'A', count: 9, from: 2 }),
      ]);
    });
  });

  describe('S2: A and B each enqueue a bulk of 4 jobs', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueueBulk({
        labels: buildLabels({ prefix: 'A', count: 4 }),
        workspaceId: 'A',
      });
      await harness.enqueueBulk({
        labels: buildLabels({ prefix: 'B', count: 4 }),
        workspaceId: 'B',
      });
    };

    it('flag off: the bulk of B waits behind the bulk of A', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'A', count: 4 }),
        ...buildLabels({ prefix: 'B', count: 4 }),
      ]);
    });

    it('flag on: the two bulks alternate, each one keeping its internal order', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'A1',
        'B1',
        'A2',
        'B2',
        'A3',
        'B3',
        'A4',
        'B4',
      ]);
    });
  });

  describe('S3: A enqueues 5 default jobs, B sends an urgent route dispatch and an app enqueueJobs job', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 5 }),
        workspaceId: 'A',
      });
      await harness.enqueue({
        label: 'R_B',
        workspaceId: 'B',
        priority: SERVER_ROUTE_DISPATCH_JOB_PRIORITY,
      });
      await harness.enqueue({
        label: 'E_B',
        workspaceId: 'B',
        priority: ENQUEUE_JOB_PRIORITY,
      });
    };

    it('flag off: the static priorities decide, the route dispatch first and the app job last', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'R_B',
        ...buildLabels({ prefix: 'A', count: 5 }),
        'E_B',
      ]);
    });

    it('flag on: the route dispatch still goes first and charges B, whose app job then takes a fair slot instead of the last one', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'R_B',
        'A1',
        'A2',
        'E_B',
        'A3',
        'A4',
        'A5',
      ]);
    });
  });

  describe('S4: W1, W2 and W3 each enqueue 2 jobs of application H, then W4 enqueues 1 job of application X', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueue({
        label: 'W1a',
        workspaceId: 'W1',
        groupKeys: [
          buildWorkspaceGroupKey('W1'),
          buildApplicationGroupKey('H'),
        ],
      });
      await harness.enqueue({
        label: 'W1b',
        workspaceId: 'W1',
        groupKeys: [
          buildWorkspaceGroupKey('W1'),
          buildApplicationGroupKey('H'),
        ],
      });
      await harness.enqueue({
        label: 'W2a',
        workspaceId: 'W2',
        groupKeys: [
          buildWorkspaceGroupKey('W2'),
          buildApplicationGroupKey('H'),
        ],
      });
      await harness.enqueue({
        label: 'W2b',
        workspaceId: 'W2',
        groupKeys: [
          buildWorkspaceGroupKey('W2'),
          buildApplicationGroupKey('H'),
        ],
      });
      await harness.enqueue({
        label: 'W3a',
        workspaceId: 'W3',
        groupKeys: [
          buildWorkspaceGroupKey('W3'),
          buildApplicationGroupKey('H'),
        ],
      });
      await harness.enqueue({
        label: 'W3b',
        workspaceId: 'W3',
        groupKeys: [
          buildWorkspaceGroupKey('W3'),
          buildApplicationGroupKey('H'),
        ],
      });
      await harness.enqueue({
        label: 'W4',
        workspaceId: 'W4',
        groupKeys: [
          buildWorkspaceGroupKey('W4'),
          buildApplicationGroupKey('X'),
        ],
      });
    };

    it('flag off: W4 waits behind the whole herd', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'W1a',
        'W1b',
        'W2a',
        'W2b',
        'W3a',
        'W3b',
        'W4',
      ]);
    });

    it('flag on: the application key makes the herd share one clock, W4 runs second', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'W1a',
        'W4',
        'W1b',
        'W2a',
        'W2b',
        'W3a',
        'W3b',
      ]);
    });
  });

  describe('S5: C keeps the queue busy with 12 jobs, A gets a burst of 6 processed, then B bursts 5 jobs and A enqueues 1 job', () => {
    const enqueueFirstPhase = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'C', count: 12 }),
        workspaceId: 'C',
      });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 6 }),
        workspaceId: 'A',
      });
    };
    const enqueueSecondPhase = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 5 }),
        workspaceId: 'B',
      });
      await harness.enqueue({ label: 'A7', workspaceId: 'A' });
    };

    it('flag off: A7 runs last, behind the rest of C and the whole burst of B', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueueFirstPhase(harness);

      expect(await harness.processNext(12)).toEqual(
        buildLabels({ prefix: 'C', count: 12 }),
      );

      await enqueueSecondPhase(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'A', count: 6 }),
        ...buildLabels({ prefix: 'B', count: 5 }),
        'A7',
      ]);
    });

    it('flag on: the processed burst of A is forgotten, A7 interleaves with the burst of B', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueueFirstPhase(harness);

      expect(await harness.processNext(12)).toEqual([
        'C1',
        'A1',
        'C2',
        'A2',
        'C3',
        'A3',
        'C4',
        'A4',
        'C5',
        'A5',
        'C6',
        'A6',
      ]);

      await enqueueSecondPhase(harness);

      expect(await harness.processAll()).toEqual([
        'B1',
        'C7',
        'B2',
        'A7',
        'C8',
        'B3',
        'C9',
        'B4',
        'C10',
        'B5',
        'C11',
        'C12',
      ]);
    });
  });

  describe('S6: A enqueues 5 jobs that get fully processed, then B enqueues 4 jobs and A enqueues 2 jobs', () => {
    const drainFirstBurst = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 5 }),
        workspaceId: 'A',
      });

      expect(await harness.processAll()).toEqual(
        buildLabels({ prefix: 'A', count: 5 }),
      );
    };
    const enqueueSecondPhase = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 4 }),
        workspaceId: 'B',
      });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 2, from: 6 }),
        workspaceId: 'A',
      });
    };

    it('flag off: B first, then A, in arrival order', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await drainFirstBurst(harness);
      await enqueueSecondPhase(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'B', count: 4 }),
        'A6',
        'A7',
      ]);
    });

    it('flag on: the virtual time caught up with A while its burst ran, A interleaves with B from the third slot', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await drainFirstBurst(harness);
      await enqueueSecondPhase(harness);

      expect(await harness.processAll()).toEqual([
        'B1',
        'B2',
        'A6',
        'B3',
        'A7',
        'B4',
      ]);
    });
  });

  describe('S7: application P weighs 2, application Q weighs 1, WP enqueues 4 jobs of P and WQ 4 jobs of Q, keyed by workspace and application', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.setWeight({
        groupKey: buildApplicationGroupKey('P'),
        weight: 2,
      });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'P', count: 4 }),
        workspaceId: 'WP',
        groupKeys: [
          buildWorkspaceGroupKey('WP'),
          buildApplicationGroupKey('P'),
        ],
      });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'Q', count: 4 }),
        workspaceId: 'WQ',
        groupKeys: [
          buildWorkspaceGroupKey('WQ'),
          buildApplicationGroupKey('Q'),
        ],
      });
    };

    it('flag off: the weight is ignored, Q waits behind P', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'P', count: 4 }),
        ...buildLabels({ prefix: 'Q', count: 4 }),
      ]);
    });

    it('flag on: P gets two slots for each slot of Q, the unweighted workspace key does not dilute the weight', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'P1',
        'P2',
        'Q1',
        'P3',
        'P4',
        'Q2',
        'Q3',
        'Q4',
      ]);
    });
  });

  describe('S7b: application P weighs 2; WP bulk-enqueues 4 jobs of P, then WP enqueues 1 more job of P and WQ enqueues 1 job of Q', () => {
    const groupKeysOfP = [
      buildWorkspaceGroupKey('WP'),
      buildApplicationGroupKey('P'),
    ];
    const enqueue = async (harness: FairnessHarness) => {
      await harness.setWeight({
        groupKey: buildApplicationGroupKey('P'),
        weight: 2,
      });
      await harness.enqueueBulk({
        labels: buildLabels({ prefix: 'P', count: 4 }),
        workspaceId: 'WP',
        groupKeys: groupKeysOfP,
      });
      await harness.enqueue({
        label: 'P5',
        workspaceId: 'WP',
        groupKeys: groupKeysOfP,
      });
      await harness.enqueue({
        label: 'Q1',
        workspaceId: 'WQ',
        groupKeys: [
          buildWorkspaceGroupKey('WQ'),
          buildApplicationGroupKey('Q'),
        ],
      });
    };

    it('flag off: FIFO', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'P', count: 5 }),
        'Q1',
      ]);
    });

    it('flag on: the bulk is spaced like single jobs of the same weight, P keeps its order and its two slots per slot of Q', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        'P1',
        'P2',
        'Q1',
        'P3',
        'P4',
        'P5',
      ]);
    });
  });

  describe('S7c: application H has 100 jobs waiting from workspaces X1 to X10, then workspace W enqueues 1 job of H and 1 job of application Q', () => {
    const herdLabels = buildLabels({ prefix: 'H', count: 100 });
    const enqueue = async (harness: FairnessHarness) => {
      for (const [index, label] of herdLabels.entries()) {
        const workspaceId = `X${(index % 10) + 1}`;

        await harness.enqueue({
          label,
          workspaceId,
          groupKeys: [
            buildWorkspaceGroupKey(workspaceId),
            buildApplicationGroupKey('H'),
          ],
        });
      }
      await harness.enqueue({
        label: 'W_H',
        workspaceId: 'W',
        groupKeys: [buildWorkspaceGroupKey('W'), buildApplicationGroupKey('H')],
      });
      await harness.enqueue({
        label: 'W_Q',
        workspaceId: 'W',
        groupKeys: [buildWorkspaceGroupKey('W'), buildApplicationGroupKey('Q')],
      });
    };

    it('flag off: W waits behind the whole backlog of H', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([...herdLabels, 'W_H', 'W_Q']);
    });

    it('flag on: the job of H takes its turn in the backlog of H, the job of Q runs right away because W is only charged for its own jobs', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(harness.readPriority({ label: 'W_H' })).toBe(ticketOf(100));
      expect(harness.readPriority({ label: 'W_Q' })).toBe(ticketOf(1));
      expect(await harness.processNext(3)).toEqual(['H1', 'H2', 'W_Q']);
      expect(await harness.processAll()).toEqual([
        ...herdLabels.slice(2),
        'W_H',
      ]);
    });
  });

  describe('S7d: application P weighs 2; X enqueues 6 jobs of P, W bulk-enqueues 4 jobs of P then 1 job of application Q, X enqueues 1 more job of P', () => {
    const groupKeysOfP = (workspaceId: string) => [
      buildWorkspaceGroupKey(workspaceId),
      buildApplicationGroupKey('P'),
    ];
    const enqueue = async (harness: FairnessHarness) => {
      await harness.setWeight({
        groupKey: buildApplicationGroupKey('P'),
        weight: 2,
      });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'P', count: 6 }),
        workspaceId: 'X',
        groupKeys: groupKeysOfP('X'),
      });
      await harness.enqueueBulk({
        labels: buildLabels({ prefix: 'B', count: 4 }),
        workspaceId: 'W',
        groupKeys: groupKeysOfP('W'),
      });
      await harness.enqueue({
        label: 'Q1',
        workspaceId: 'W',
        groupKeys: [buildWorkspaceGroupKey('W'), buildApplicationGroupKey('Q')],
      });
      await harness.enqueue({
        label: 'P7',
        workspaceId: 'X',
        groupKeys: groupKeysOfP('X'),
      });
    };

    it('flag off: FIFO', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'P', count: 6 }),
        ...buildLabels({ prefix: 'B', count: 4 }),
        'Q1',
        'P7',
      ]);
    });

    it('flag on: the bulk fills the half-slots it allocated on P, W is charged those half-slots only, so its job of Q (ticket 2, like P6) overtakes its bulk and the next job of P follows the bulk', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(harness.readPriority({ label: 'B1' })).toBe(ticketOf(3));
      expect(harness.readPriority({ label: 'B4' })).toBe(ticketOf(4));
      expect(harness.readPriority({ label: 'Q1' })).toBe(ticketOf(2));
      expect(harness.readPriority({ label: 'P7' })).toBe(ticketOf(5));
      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'P', count: 6 }),
        'Q1',
        ...buildLabels({ prefix: 'B', count: 4 }),
        'P7',
      ]);
    });
  });

  describe('S8: Redis is unavailable, A enqueues 3 jobs and B enqueues 1 job', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 3 }),
        workspaceId: 'A',
      });
      await harness.enqueue({ label: 'B1', workspaceId: 'B' });
    };
    const expectedOrder = [...buildLabels({ prefix: 'A', count: 3 }), 'B1'];

    it('flag off: Redis is never called and the order is FIFO', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });
      const runCommand = harness.breakRedis();

      await enqueue(harness);

      expect(await harness.processAll()).toEqual(expectedOrder);
      expect(runCommand).not.toHaveBeenCalled();
      expect(
        harness.metricsService.incrementCounterForEvent,
      ).not.toHaveBeenCalledWith(
        expect.objectContaining({ key: MetricsKeys.JobFairTagFallback }),
      );
    });

    it('flag on: every job falls back to FIFO and the fallback is counted', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      harness.breakRedis();
      await enqueue(harness);

      expect(await harness.processAll()).toEqual(expectedOrder);
      expect(
        harness.metricsService.incrementCounterForEvent.mock.calls.filter(
          ([event]) => event.key === MetricsKeys.JobFairTagFallback,
        ),
      ).toHaveLength(4);
    });
  });

  describe('S9: 3 jobs without workspaceId, then 1 job of workspace W', () => {
    const enqueue = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'S', count: 3 }),
      });
      await harness.enqueue({ label: 'W1', workspaceId: 'W' });
    };

    it('flag off: the workspace job waits behind the system jobs', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual([
        ...buildLabels({ prefix: 'S', count: 3 }),
        'W1',
      ]);
    });

    it('flag on: the system jobs form one group, the workspace job runs second', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueue(harness);

      expect(await harness.processAll()).toEqual(['S1', 'W1', 'S2', 'S3']);
    });
  });

  describe('S10: A enqueues 1 job delayed by 1 second, then C enqueues 5 jobs, 3 of them get processed before the second elapses', () => {
    const enqueueAndProcessThree = async (harness: FairnessHarness) => {
      await harness.enqueue({ label: 'D1', workspaceId: 'A', delay: 1000 });
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'C', count: 5 }),
        workspaceId: 'C',
      });

      expect(await harness.processNext(3)).toEqual(['C1', 'C2', 'C3']);

      harness.advanceTime({ milliseconds: 1000 });
    };

    it('flag off: the delayed job waits its second, then joins the end of the FIFO backlog', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueueAndProcessThree(harness);

      expect(await harness.processAll()).toEqual(['C4', 'C5', 'D1']);
    });

    it('flag on: the delayed job keeps the static priority and no clock is charged, so when due it sorts among the tickets at the default priority until it gets ticketed at its due time', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueueAndProcessThree(harness);

      expect(
        await harness.readClock({ groupKey: buildWorkspaceGroupKey('A') }),
      ).toBeUndefined();
      expect(await harness.processAll()).toEqual(['C4', 'D1', 'C5']);
    });
  });

  describe('S11: A has 5 jobs waiting and B an app enqueueJobs job; after 2 jobs, A sends an urgent route dispatch', () => {
    const enqueueBacklog = async (harness: FairnessHarness) => {
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 5 }),
        workspaceId: 'A',
      });
      await harness.enqueue({
        label: 'E_B',
        workspaceId: 'B',
        priority: ENQUEUE_JOB_PRIORITY,
      });
    };
    const enqueueRouteDispatch = async (harness: FairnessHarness) => {
      await harness.enqueue({
        label: 'R_A',
        workspaceId: 'A',
        priority: SERVER_ROUTE_DISPATCH_JOB_PRIORITY,
      });
    };

    it('flag off: the route dispatch jumps ahead of its own backlog, the app job waits for every default job', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await enqueueBacklog(harness);

      expect(await harness.processNext(2)).toEqual(['A1', 'A2']);

      await enqueueRouteDispatch(harness);

      expect(await harness.processAll()).toEqual([
        'R_A',
        'A3',
        'A4',
        'A5',
        'E_B',
      ]);
    });

    it('flag on: the app job takes a fair slot, the route dispatch still jumps ahead of everything', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await enqueueBacklog(harness);

      expect(await harness.processNext(2)).toEqual(['A1', 'E_B']);

      await enqueueRouteDispatch(harness);

      expect(await harness.processAll()).toEqual([
        'R_A',
        'A2',
        'A3',
        'A4',
        'A5',
      ]);
    });
  });
});
