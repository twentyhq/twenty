import { Test, type TestingModule } from '@nestjs/testing';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { DEFERRED_DATABASE_EVENT_TRIGGER_FLUSH_DELAY_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/deferred-database-event-trigger-flush-delay-ms.constant';
import { DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/constants/deferred-database-event-trigger-ttl-ms.constant';
import { DeferredDatabaseEventTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/services/deferred-database-event-trigger.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceSignalService } from 'src/engine/core-modules/workspace-signal/services/workspace-signal.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const LOGIC_FUNCTION_ID = 'logic-function-id';
const OTHER_LOGIC_FUNCTION_ID = 'other-logic-function-id';

const buildMaps = (
  entities: ({ id: string; universalIdentifier: string } & Record<
    string,
    unknown
  >)[],
) =>
  entities.reduce(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity as never,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const messageParticipantObjectMetadata = getFlatObjectMetadataMock({
  id: 'message-participant-object-id',
  universalIdentifier: 'message-participant-object-id',
  nameSingular: 'messageParticipant',
  namePlural: 'messageParticipants',
});

describe('DeferredDatabaseEventTriggerService', () => {
  let service: DeferredDatabaseEventTriggerService;
  let cacheStorage: Record<string, jest.Mock>;
  let messageQueueService: { bulkAdd: jest.Mock };
  let workspaceSignalService: { read: jest.Mock };
  let flatLogicFunctions: ({ id: string; universalIdentifier: string } & Record<
    string,
    unknown
  >)[];

  beforeEach(async () => {
    cacheStorage = {
      setAdd: jest.fn().mockResolvedValue(undefined),
      setIfAbsent: jest.fn().mockResolvedValue(true),
      incrBy: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true),
      setMembers: jest.fn().mockResolvedValue([]),
      setRemove: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(undefined),
      mdel: jest.fn().mockResolvedValue(undefined),
    };
    messageQueueService = { bulkAdd: jest.fn().mockResolvedValue([]) };
    workspaceSignalService = { read: jest.fn().mockResolvedValue({}) };
    flatLogicFunctions = [
      {
        id: LOGIC_FUNCTION_ID,
        universalIdentifier: LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        deletedAt: null,
        databaseEventTriggerSettings: {
          eventName: 'messageParticipant.updated',
          conditions: {
            signals: { 'messaging.initialImport': false },
            onMismatch: 'deferUntilMatch',
          },
        },
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeferredDatabaseEventTriggerService,
        {
          provide: CacheStorageNamespace.EngineDeferredDatabaseEventTrigger,
          useValue: cacheStorage,
        },
        {
          provide: getQueueToken(MessageQueue.logicFunctionQueue),
          useValue: messageQueueService,
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockImplementation(async () => ({
              flatLogicFunctionMaps: buildMaps(flatLogicFunctions),
              flatObjectMetadataMaps: buildMaps([
                messageParticipantObjectMetadata,
              ]),
            })),
          },
        },
        { provide: WorkspaceSignalService, useValue: workspaceSignalService },
      ],
    }).compile();

    service = module.get(DeferredDatabaseEventTriggerService);
  });

  describe('defer', () => {
    it('notes the function under the signal, keeps the first since and counts dropped events', async () => {
      await service.defer({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
        logicFunctionId: LOGIC_FUNCTION_ID,
        droppedEventCount: 200,
      });

      expect(cacheStorage.setAdd).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:messaging.initialImport`,
        [LOGIC_FUNCTION_ID],
        DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
      );
      expect(cacheStorage.setIfAbsent).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:${LOGIC_FUNCTION_ID}:since`,
        expect.any(String),
        DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
      );
      expect(cacheStorage.incrBy).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:${LOGIC_FUNCTION_ID}:dropped`,
        200,
      );
    });

    it('keeps the first since alive while the function keeps missing batches', async () => {
      cacheStorage.setIfAbsent.mockResolvedValue(false);

      await service.defer({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
        logicFunctionId: LOGIC_FUNCTION_ID,
        droppedEventCount: 0,
      });

      expect(cacheStorage.expire).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:${LOGIC_FUNCTION_ID}:since`,
        DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
      );
    });

    it('does not touch the counter when nothing was dropped', async () => {
      await service.defer({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
        logicFunctionId: LOGIC_FUNCTION_ID,
        droppedEventCount: 0,
      });

      expect(cacheStorage.incrBy).not.toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    it('does nothing when no function was deferred on the signal', async () => {
      await service.flush({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
      });

      expect(cacheStorage.setRemove).not.toHaveBeenCalled();
      expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
    });

    it('enqueues one delayed catch-up per deferred function with the missed window', async () => {
      cacheStorage.setMembers.mockResolvedValue([LOGIC_FUNCTION_ID]);
      cacheStorage.get.mockImplementation(async (key: string) =>
        key.endsWith(':since') ? '2026-10-06T09:00:00.000Z' : 8400,
      );

      await service.flush({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
      });

      expect(cacheStorage.setRemove).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:messaging.initialImport`,
        [LOGIC_FUNCTION_ID],
      );
      expect(cacheStorage.mdel).toHaveBeenCalledWith([
        `${WORKSPACE_ID}:${LOGIC_FUNCTION_ID}:since`,
        `${WORKSPACE_ID}:${LOGIC_FUNCTION_ID}:dropped`,
      ]);
      expect(messageQueueService.bulkAdd).toHaveBeenCalledWith(
        LogicFunctionTriggerJob.name,
        [
          {
            data: {
              logicFunctionId: LOGIC_FUNCTION_ID,
              workspaceId: WORKSPACE_ID,
              payload: {
                name: 'messageParticipant.updated',
                workspaceId: WORKSPACE_ID,
                objectMetadata: messageParticipantObjectMetadata,
                events: [],
                deferred: {
                  signal: 'messaging.initialImport',
                  since: '2026-10-06T09:00:00.000Z',
                  droppedEventCount: 8400,
                },
              },
            },
          },
        ],
        expect.objectContaining({
          delay: DEFERRED_DATABASE_EVENT_TRIGGER_FLUSH_DELAY_MS,
        }),
      );
    });

    it('keeps the deferred state when the catch-up cannot be enqueued', async () => {
      cacheStorage.setMembers.mockResolvedValue([LOGIC_FUNCTION_ID]);
      messageQueueService.bulkAdd.mockRejectedValue(new Error('queue down'));

      await expect(
        service.flush({
          workspaceId: WORKSPACE_ID,
          signal: 'messaging.initialImport',
        }),
      ).rejects.toThrow('queue down');

      expect(cacheStorage.setRemove).not.toHaveBeenCalled();
      expect(cacheStorage.mdel).not.toHaveBeenCalled();
    });

    it('keeps waiting on a function whose other signal condition still fails', async () => {
      flatLogicFunctions[0].databaseEventTriggerSettings = {
        eventName: 'messageParticipant.updated',
        conditions: {
          signals: {
            'messaging.initialImport': false,
            'calendar.initialImport': false,
          },
          onMismatch: 'deferUntilMatch',
        },
      };
      cacheStorage.setMembers.mockResolvedValue([LOGIC_FUNCTION_ID]);
      workspaceSignalService.read.mockResolvedValue({
        'calendar.initialImport': { since: '2026-10-06T09:30:00.000Z' },
      });

      await service.flush({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
      });

      expect(cacheStorage.setAdd).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:calendar.initialImport`,
        [LOGIC_FUNCTION_ID],
        DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
      );
      expect(cacheStorage.setRemove).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:messaging.initialImport`,
        [LOGIC_FUNCTION_ID],
      );
      expect(cacheStorage.mdel).not.toHaveBeenCalled();
      expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
    });

    it('keeps a function whose condition on the flushed signal still fails', async () => {
      cacheStorage.setMembers.mockResolvedValue([LOGIC_FUNCTION_ID]);
      workspaceSignalService.read.mockResolvedValue({
        'messaging.initialImport': { since: '2026-10-06T09:30:00.000Z' },
      });

      await service.flush({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
      });

      expect(cacheStorage.setAdd).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:messaging.initialImport`,
        [LOGIC_FUNCTION_ID],
        DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS,
      );
      expect(cacheStorage.setRemove).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:messaging.initialImport`,
        [],
      );
      expect(cacheStorage.mdel).not.toHaveBeenCalled();
      expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
    });

    it('forgets functions that no longer exist', async () => {
      cacheStorage.setMembers.mockResolvedValue([OTHER_LOGIC_FUNCTION_ID]);

      await service.flush({
        workspaceId: WORKSPACE_ID,
        signal: 'messaging.initialImport',
      });

      expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
      expect(cacheStorage.setRemove).toHaveBeenCalledWith(
        `${WORKSPACE_ID}:messaging.initialImport`,
        [OTHER_LOGIC_FUNCTION_ID],
      );
    });
  });
});
