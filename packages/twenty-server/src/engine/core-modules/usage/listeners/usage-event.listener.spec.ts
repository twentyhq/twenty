import { Logger } from '@nestjs/common';

import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageEventListener } from 'src/engine/core-modules/usage/listeners/usage-event.listener';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

const USAGE_EVENT: UsageEvent = {
  resourceType: UsageResourceType.WORKFLOW,
  operationType: UsageOperationType.WORKFLOW_EXECUTION,
  quantity: 1,
  unit: UsageUnit.INVOCATION,
  creditsUsedMicro: 1,
};

const buildBatch = (
  overrides: Partial<CustomWorkspaceEventBatch<UsageEvent>> = {},
): CustomWorkspaceEventBatch<UsageEvent> =>
  ({
    workspaceId: 'ws-1',
    events: [USAGE_EVENT],
    ...overrides,
  }) as CustomWorkspaceEventBatch<UsageEvent>;

describe('UsageEventListener', () => {
  let listener: UsageEventListener;
  let enqueue: jest.Mock;
  let isEnabled: jest.Mock;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    enqueue = jest.fn().mockResolvedValue(undefined);
    isEnabled = jest.fn().mockReturnValue(true);

    listener = new UsageEventListener({
      enqueue,
      isEnabled,
    } as unknown as WorkspaceEventSinkService);
  });

  it('enqueues a usageEvent envelope for each event in the batch', async () => {
    await listener.handleUsageRecordedEvent(buildBatch());

    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        table: 'usageEvent',
        row: expect.objectContaining({ workspaceId: 'ws-1' }),
      }),
    ]);
  });

  it('skips when the batch has no workspaceId', async () => {
    await listener.handleUsageRecordedEvent(
      buildBatch({ workspaceId: undefined }),
    );

    expect(enqueue).not.toHaveBeenCalled();
  });

  it('skips when no sink is configured', async () => {
    isEnabled.mockReturnValue(false);

    await listener.handleUsageRecordedEvent(buildBatch());

    expect(enqueue).not.toHaveBeenCalled();
  });

  it('swallows enqueue errors (usage analytics is best-effort)', async () => {
    enqueue.mockRejectedValue(new Error('queue down'));

    await expect(
      listener.handleUsageRecordedEvent(buildBatch()),
    ).resolves.toBeUndefined();
  });
});
