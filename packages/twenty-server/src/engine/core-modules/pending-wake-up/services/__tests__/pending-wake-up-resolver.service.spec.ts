import { isDefined } from 'twenty-shared/utils';

import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { type PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { type PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';
import { type FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';

const wakeUp = {
  id: 'wake-up-id',
  workspaceId: 'workspace-id',
  ownerType: 'WORKFLOW_STEP',
  ownerId: 'workflow-run-id',
  ownerKey: 'step-id',
  eventName: 'company.updated',
  condition: { type: 'EVENT', eventName: 'company.updated' },
  resumeAt: null,
} as PendingWakeUpEntity;

const buildEvent = (recordId: string): PendingWakeUpEvent => ({
  eventName: 'company.updated',
  recordId,
  record: { id: recordId, name: 'After', secret: 'hidden' },
  before: { id: recordId, name: 'Before', secret: 'hidden' },
  updatedFields: ['name', 'secret'],
});

const privateCompanyEvent = buildEvent('company-a');
const sharedCompanyEvent = buildEvent('company-b');

const buildResolver = ({
  readableRecordIds = [],
  isReadFailing = false,
}: {
  readableRecordIds?: string[];
  isReadFailing?: boolean;
}) => {
  const pendingWakeUpService = {
    find: jest.fn().mockResolvedValue(wakeUp),
    scheduleResolution: jest.fn(),
  };
  const handler = {
    getOwnerState: jest
      .fn()
      .mockResolvedValue({ status: 'WAITING', owner: { id: 'owner' } }),
    getReadPermissions: jest.fn().mockResolvedValue({}),
    resolve: jest.fn(),
  };
  const findRecordsService = {
    execute: jest.fn(
      async ({ filter }: { filter: { id: { in?: string[]; eq?: string } } }) =>
        isReadFailing
          ? { success: false, error: 'Read failed' }
          : {
              success: true,
              result: {
                records: (filter.id.in ?? [filter.id.eq])
                  .filter(
                    (recordId) =>
                      isDefined(recordId) &&
                      readableRecordIds.includes(recordId),
                  )
                  .map((recordId) => ({ id: recordId, name: 'After' })),
              },
            },
    ),
  };

  return {
    resolver: new PendingWakeUpResolverService(
      pendingWakeUpService as unknown as PendingWakeUpService,
      {
        getHandlerOrThrow: () => handler,
      } as unknown as PendingWakeUpOwnerHandlerRegistryService,
      findRecordsService as unknown as FindRecordsService,
    ),
    pendingWakeUpService,
    handler,
  };
};

describe('PendingWakeUpResolverService', () => {
  it('resumes with the first match the owner can read when an earlier one is not readable', async () => {
    const { resolver, handler } = buildResolver({
      readableRecordIds: ['company-b'],
    });

    await resolver.resolve({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
      event: privateCompanyEvent,
      nextEvents: [sharedCompanyEvent],
    });

    expect(handler.resolve).toHaveBeenCalledTimes(1);
    expect(handler.resolve).toHaveBeenCalledWith({
      wakeUp,
      outcome: {
        type: 'EVENT_RECEIVED',
        event: {
          eventName: 'company.updated',
          recordId: 'company-b',
          record: { id: 'company-b', name: 'After' },
          before: { id: 'company-b', name: 'Before' },
          updatedFields: ['name'],
        },
      },
      isOwnerGone: false,
    });
  });

  it('keeps the wake-up waiting when the owner can read none of the matches', async () => {
    const { resolver, handler } = buildResolver({});

    await resolver.resolve({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
      event: privateCompanyEvent,
      nextEvents: [sharedCompanyEvent],
    });

    expect(handler.resolve).not.toHaveBeenCalled();
  });

  it('resolves a job queued with a single event', async () => {
    const { resolver, handler } = buildResolver({
      readableRecordIds: ['company-b'],
    });

    await resolver.resolve({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
      event: sharedCompanyEvent,
    });

    expect(handler.resolve).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: expect.objectContaining({
          event: expect.objectContaining({ recordId: 'company-b' }),
        }),
      }),
    );
  });

  it('retries a failed read with every match of the batch', async () => {
    const { resolver, handler, pendingWakeUpService } = buildResolver({
      isReadFailing: true,
    });

    await resolver.resolve({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
      event: privateCompanyEvent,
      nextEvents: [sharedCompanyEvent],
    });

    expect(handler.resolve).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith(
      expect.objectContaining({
        event: privateCompanyEvent,
        nextEvents: [sharedCompanyEvent],
        recordReadAttempt: 1,
      }),
    );
  });
});
