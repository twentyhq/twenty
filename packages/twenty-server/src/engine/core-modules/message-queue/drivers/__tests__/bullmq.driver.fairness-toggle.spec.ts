import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';

describe('BullMQDriver fairness toggle', () => {
  beforeAll(silenceDriverLogs);

  describe('S12: A has jobs waiting when IS_WORKER_FAIRNESS_ENABLED changes, then B enqueues jobs', () => {
    it('turned on: the first tickets start at the virtual time and pass the static backlog, which then drains FIFO ahead of the next tickets', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: false });

      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 3 }),
        workspaceId: 'A',
      });
      harness.setFairnessEnabled(true);
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 2 }),
        workspaceId: 'B',
      });

      expect(await harness.processNext(3)).toEqual(['B1', 'B2', 'A1']);

      await harness.enqueue({ label: 'B3', workspaceId: 'B' });

      expect(await harness.processAll()).toEqual(['A2', 'A3', 'B3']);
    });

    it('turned off: the new jobs take the static priority, behind the tickets below it and ahead of the rest of the backlog', async () => {
      const harness = await createFairnessHarness({ isFairnessEnabled: true });

      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'A', count: 5 }),
        workspaceId: 'A',
      });
      harness.setFairnessEnabled(false);
      await harness.enqueueMany({
        labels: buildLabels({ prefix: 'B', count: 2 }),
        workspaceId: 'B',
      });

      expect(await harness.processAll()).toEqual([
        'A1',
        'A2',
        'A3',
        'A4',
        'B1',
        'B2',
        'A5',
      ]);
    });
  });
});
