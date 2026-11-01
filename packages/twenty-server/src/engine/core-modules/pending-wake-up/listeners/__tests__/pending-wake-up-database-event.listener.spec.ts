import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpDatabaseEventListener } from 'src/engine/core-modules/pending-wake-up/listeners/pending-wake-up-database-event.listener';
import { type PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const buildWakeUp = (overrides: Partial<PendingWakeUpEntity> = {}) =>
  ({
    id: 'wake-up-id',
    workspaceId: 'workspace-id',
    ownerType: 'WORKFLOW_STEP',
    ownerId: 'workflow-run-id',
    ownerKey: 'step-id',
    eventName: 'company.updated',
    condition: {
      type: 'EVENT',
      eventName: 'company.updated',
      recordId: 'record-b',
    },
    resumeAt: null,
    ...overrides,
  }) as PendingWakeUpEntity;

const buildUpdateEvent = (recordId: string) =>
  ({
    recordId,
    properties: {
      before: { name: 'Before' },
      after: { name: 'After' },
      updatedFields: ['name'],
      diff: {},
    },
  }) as unknown as ObjectRecordEvent;

const payload = {
  workspaceId: 'workspace-id',
  name: 'company.updated',
  events: [buildUpdateEvent('record-a'), buildUpdateEvent('record-b')],
} as unknown as WorkspaceEventBatch<ObjectRecordEvent>;

const buildListener = (wakeUps: PendingWakeUpEntity[]) => {
  const pendingWakeUpService = {
    findEventWakeUps: jest.fn().mockResolvedValue(wakeUps),
    scheduleResolution: jest.fn(),
  };

  return {
    listener: new PendingWakeUpDatabaseEventListener(
      pendingWakeUpService as unknown as PendingWakeUpService,
    ),
    pendingWakeUpService,
  };
};

describe('PendingWakeUpDatabaseEventListener', () => {
  it('hands the matching event to its resolution without checking it against any role', async () => {
    const wakeUp = buildWakeUp();
    const { listener, pendingWakeUpService } = buildListener([wakeUp]);

    await listener.handleObjectRecordUpdateEvent(payload);

    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledTimes(1);
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith({
      wakeUp,
      event: {
        eventName: 'company.updated',
        recordId: 'record-b',
        record: { name: 'After' },
        before: { name: 'Before' },
        updatedFields: ['name'],
      },
    });
  });

  it('hands every match of a wildcard wake-up to a single resolution', async () => {
    const wakeUp = buildWakeUp({
      condition: { type: 'EVENT', eventName: 'company.updated' },
    });
    const { listener, pendingWakeUpService } = buildListener([wakeUp]);

    await listener.handleObjectRecordUpdateEvent(payload);

    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledTimes(1);
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith({
      wakeUp,
      event: expect.objectContaining({ recordId: 'record-a' }),
      nextEvents: [expect.objectContaining({ recordId: 'record-b' })],
    });
  });

  it('caps the matches handed to a resolution at what one read returns', async () => {
    const { listener, pendingWakeUpService } = buildListener([
      buildWakeUp({
        condition: { type: 'EVENT', eventName: 'company.updated' },
      }),
    ]);

    await listener.handleObjectRecordUpdateEvent({
      ...payload,
      events: Array.from({ length: QUERY_MAX_RECORDS + 5 }, (_, index) =>
        buildUpdateEvent(`record-${index}`),
      ),
    });

    const [{ event, nextEvents }] =
      pendingWakeUpService.scheduleResolution.mock.calls[0];

    expect(event.recordId).toBe('record-0');
    expect(nextEvents).toHaveLength(QUERY_MAX_RECORDS - 1);
    expect(nextEvents.at(-1).recordId).toBe(`record-${QUERY_MAX_RECORDS - 1}`);
  });

  it('leaves an expired wake-up to its timeout', async () => {
    const { listener, pendingWakeUpService } = buildListener([
      buildWakeUp({ resumeAt: new Date(Date.now() - 1000) }),
    ]);

    await listener.handleObjectRecordUpdateEvent(payload);

    expect(pendingWakeUpService.scheduleResolution).not.toHaveBeenCalled();
  });
});
