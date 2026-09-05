import { Logger } from '@nestjs/common';

import { IsNull, QueryFailedError } from 'typeorm';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemOutcome } from 'src/engine/core-modules/inbox/enums/inbox-item-outcome.enum';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxExceptionCode } from 'src/engine/core-modules/inbox/inbox.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

// What Postgres actually raises through TypeORM when a partial unique index
// rejects a concurrent insert
const buildUniqueViolation = () =>
  Object.assign(
    new QueryFailedError('insert', [], new Error('duplicate key')),
    {
      code: '23505',
    },
  );

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const THREAD_OWNER_USER_WORKSPACE_ID = 'thread-owner-user-workspace-id';
const FALLBACK_USER_WORKSPACE_ID = 'fallback-user-workspace-id';
const CONVERSATION_TYPE_ID = 'conversation-type-id';
const RUN_FAILED_TYPE_ID = 'run-failed-type-id';
const EXISTING_ITEM_ID = 'existing-item-id';
const INSERTED_ITEM_ID = 'inserted-item-id';
const THREAD_SLOT_KEY = `thread:${THREAD_ID}`;
const RUN_SLOT_KEY = 'workflow-run:run-id';
const TRIAGE_QUEUE_ID = 'triage-queue-id';
const SUPPORT_QUEUE_ID = 'support-queue-id';
const NOW = new Date('2026-08-07T10:00:00.000Z');

const CONVERSATION_TYPE = {
  id: CONVERSATION_TYPE_ID,
  key: 'conversation',
  label: 'Conversation',
  defaultPriority: InboxItemPriority.UPDATE,
} as InboxItemTypeEntity;

const RUN_FAILED_TYPE = {
  id: RUN_FAILED_TYPE_ID,
  key: 'workflow_run_failed',
  label: 'Workflow run failed',
  defaultPriority: InboxItemPriority.NEEDS_ACTION,
} as InboxItemTypeEntity;

const buildInboxItem = (
  overrides: Partial<InboxItemEntity> = {},
): InboxItemEntity =>
  ({
    id: EXISTING_ITEM_ID,
    workspaceId: WORKSPACE_ID,
    inboxItemTypeId: CONVERSATION_TYPE_ID,
    priority: InboxItemPriority.UPDATE,
    title: 'An older message',
    assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
    slotKey: THREAD_SLOT_KEY,
    lastEventAt: new Date('2026-01-01T00:00:00.000Z'),
    clearedAt: null,
    ...overrides,
  }) as InboxItemEntity;

const threadSubject = {
  kind: 'thread',
  threadId: THREAD_ID,
  ownerUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
} as const;

describe('InboxRouterService', () => {
  let service: InboxRouterService;
  let loggerWarnSpy: jest.SpyInstance;

  const inboxItemRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    insertAndReturnOne: jest.fn(),
    update: jest.fn(),
    withManager: jest.fn(),
  };

  const inboxItemToolCallRepository = {
    insert: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    withManager: jest.fn(),
  };

  // Transactions run their body against the same mocks, so a test reads the
  // writes back the same way whether or not they were wrapped
  const coreDataSource = {
    transaction: jest.fn((run: (manager: unknown) => unknown) => run({})),
  };

  const inboxItemTypeService = {
    findByKey: jest.fn(),
  };

  const featureFlagService = {
    isFeatureEnabled: jest.fn(),
  };

  const inboxQueueService = {
    findOrCreateDefaultQueue: jest.fn(),
  };

  const userWorkspaceService = {
    getWorkspaceMember: jest.fn(),
    getUserWorkspaceForUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);

    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    inboxItemTypeService.findByKey.mockResolvedValue(CONVERSATION_TYPE);
    featureFlagService.isFeatureEnabled.mockResolvedValue(true);
    inboxQueueService.findOrCreateDefaultQueue.mockResolvedValue({
      id: TRIAGE_QUEUE_ID,
    });
    userWorkspaceService.getWorkspaceMember.mockResolvedValue(null);
    userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);
    inboxItemRepository.findOne.mockResolvedValue(null);
    inboxItemRepository.findOneBy.mockResolvedValue(null);
    inboxItemRepository.update.mockResolvedValue({ affected: 1 });
    inboxItemToolCallRepository.find.mockResolvedValue([]);
    inboxItemRepository.withManager.mockReturnValue(inboxItemRepository);
    inboxItemToolCallRepository.withManager.mockReturnValue(
      inboxItemToolCallRepository,
    );
    inboxItemRepository.insertAndReturnOne.mockImplementation(
      (_workspaceId, inboxItem) =>
        Promise.resolve({ id: INSERTED_ITEM_ID, ...inboxItem }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxRouterService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemToolCallEntity),
          useValue: inboxItemToolCallRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: coreDataSource,
        },
        {
          provide: InboxItemTypeService,
          useValue: inboxItemTypeService,
        },
        {
          provide: InboxQueueService,
          useValue: inboxQueueService,
        },
        {
          provide: FeatureFlagService,
          useValue: featureFlagService,
        },
        {
          provide: UserWorkspaceService,
          useValue: userWorkspaceService,
        },
      ],
    }).compile();

    service = module.get<InboxRouterService>(InboxRouterService);
  });

  afterEach(() => {
    loggerWarnSpy.mockRestore();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('feature flag gating', () => {
    it('should write nothing at all when the inbox is disabled for the workspace', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      const result = await service.route({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      expect(result).toBeNull();
      expect(inboxItemTypeService.findByKey).not.toHaveBeenCalled();
      expect(inboxItemRepository.insertAndReturnOne).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    // Cleanup stays ungated on purpose: an item that already exists has to be
    // kept in step even while the flag is off, or turning it back on would
    // resurface work for a thread that is gone
    it('should still retitle an existing item when the inbox is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      await service.renameThreadItem({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        title: 'A renamed conversation',
      });

      expect(inboxItemRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should still clear an existing item when the inbox is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      await service.clearByThreadId({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
      });

      expect(inboxItemRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  // route() is best effort for producers; routeOrThrow() is for callers whose
  // whole purpose was the item, so it reports the failure instead of a null
  describe('routeOrThrow', () => {
    it('should throw rather than return null when the inbox is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      const routeOrThrow = service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'approval',
        title: 'Approve the discount',
      });

      await expect(routeOrThrow).rejects.toMatchObject({
        code: InboxExceptionCode.INBOX_DISABLED,
      });
      expect(inboxItemRepository.insertAndReturnOne).not.toHaveBeenCalled();
    });

    it('should throw when the item could not be written', async () => {
      inboxItemRepository.findOne.mockResolvedValue({ id: EXISTING_ITEM_ID });
      inboxItemRepository.findOneBy.mockResolvedValue(null);

      const routeOrThrow = service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      await expect(routeOrThrow).rejects.toMatchObject({
        code: InboxExceptionCode.INTERNAL_SERVER_ERROR,
      });
    });

    it('should return the item when routing succeeds', async () => {
      const inboxItem = await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      expect(inboxItem).toBeDefined();
    });
  });

  describe('routeItem', () => {
    it('should insert an item keyed on the subject and assigned to the thread owner when no item exists yet', async () => {
      const result = await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        context: { summary: 'Hello there' },
        subject: threadSubject,
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledTimes(1);
      // The workspace scope is the repository's first argument, never a column
      // in the payload
      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          inboxItemTypeId: CONVERSATION_TYPE_ID,
          priority: InboxItemPriority.UPDATE,
          title: 'A message from Alice',
          context: { summary: 'Hello there' },
          queueId: null,
          assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
          slotKey: THREAD_SLOT_KEY,
          threadId: THREAD_ID,
          subjectObjectMetadataId: null,
          subjectRecordId: null,
        },
      );
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: INSERTED_ITEM_ID }));
    });

    it('should derive the slot from a record subject when the subject is a record', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A record needs attention',
        target: {
          kind: 'userWorkspace',
          userWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        },
        subject: {
          kind: 'record',
          objectMetadataId: 'object-metadata-id',
          recordId: 'record-id',
        },
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          slotKey: 'record:object-metadata-id:record-id',
          assigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
          threadId: null,
          subjectObjectMetadataId: 'object-metadata-id',
          subjectRecordId: 'record-id',
        }),
      );
    });

    it('should prefer a producer supplied slot over the subject when both are given', async () => {
      inboxItemTypeService.findByKey.mockResolvedValue(RUN_FAILED_TYPE);

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'workflow_run_failed',
        title: 'A workflow run failed',
        slotKey: RUN_SLOT_KEY,
        target: {
          kind: 'userWorkspace',
          userWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        },
        subject: {
          kind: 'record',
          objectMetadataId: 'object-metadata-id',
          recordId: 'record-id',
        },
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ slotKey: RUN_SLOT_KEY }),
      );
    });

    it('should always insert without looking for an existing item when no slot resolves', async () => {
      inboxItemTypeService.findByKey.mockResolvedValue(RUN_FAILED_TYPE);

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'workflow_run_failed',
        title: 'A workflow run failed',
        target: {
          kind: 'userWorkspace',
          userWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        },
      });

      expect(inboxItemRepository.findOne).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ slotKey: null }),
      );
    });

    it('should fold into the item holding the slot instead of inserting a second one', async () => {
      inboxItemRepository.findOne.mockResolvedValue(buildInboxItem());
      inboxItemRepository.findOneBy.mockResolvedValue(
        buildInboxItem({ title: 'A newer message' }),
      );

      const result = await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A newer message',
        subject: threadSubject,
      });

      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: {
          queueId: IsNull(),
          assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
          slotKey: THREAD_SLOT_KEY,
        },
      });
      expect(inboxItemRepository.insertAndReturnOne).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EXISTING_ITEM_ID },
        expect.objectContaining({
          inboxItemTypeId: CONVERSATION_TYPE_ID,
          title: 'A newer message',
          priority: InboxItemPriority.UPDATE,
        }),
      );

      const [, , partialUpdate] = inboxItemRepository.update.mock.calls[0];

      expect(partialUpdate.lastEventAt()).toBe('clock_timestamp()');
      expect(result).toEqual(
        expect.objectContaining({ title: 'A newer message' }),
      );
    });

    // The whole point of comparing lastEventAt against clearedAt: a producer
    // reports what happened and never has to undo the assignee's decision.
    it('should revive a cleared item by moving the event past the clear, touching nothing else', async () => {
      inboxItemRepository.findOne.mockResolvedValue(
        buildInboxItem({
          clearedAt: new Date('2026-02-01T00:00:00.000Z'),
          clearedByUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
          resurfaceAt: new Date('2026-03-01T00:00:00.000Z'),
          readAt: new Date('2026-02-01T00:00:00.000Z'),
          outcome: InboxItemOutcome.DONE,
        }),
      );

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A reply on a conversation that was done',
        subject: threadSubject,
      });

      const [, , partialUpdate] = inboxItemRepository.update.mock.calls[0];

      expect(partialUpdate.lastEventAt()).toBe('clock_timestamp()');
      expect(partialUpdate).not.toHaveProperty('clearedAt');
      expect(partialUpdate).not.toHaveProperty('clearedByUserWorkspaceId');
      expect(partialUpdate).not.toHaveProperty('resurfaceAt');
      expect(partialUpdate).not.toHaveProperty('readAt');
    });

    it('should fall back to the type label when the producer sends no title', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        subject: threadSubject,
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ title: 'Conversation' }),
      );
    });

    it('should leave the title and context untouched when folding without them', async () => {
      inboxItemRepository.findOne.mockResolvedValue(
        buildInboxItem({
          title: 'An older message',
          context: { summary: 'Hello there' },
        }),
      );

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        subject: threadSubject,
      });

      const [, , partialUpdate] = inboxItemRepository.update.mock.calls[0];

      expect(partialUpdate).not.toHaveProperty('title');
      expect(partialUpdate).not.toHaveProperty('context');
      expect(inboxItemToolCallRepository.delete).not.toHaveBeenCalled();
    });

    it('should insert the proposed calls in order under a new item', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A plan',
        subject: threadSubject,
        toolCalls: [
          { toolName: 'send_email', label: 'Send email', proposedInput: {} },
          { toolName: 'create_task', label: 'Create task', proposedInput: {} },
        ],
      });

      expect(inboxItemToolCallRepository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        [
          expect.objectContaining({
            inboxItemId: INSERTED_ITEM_ID,
            position: 0,
            toolName: 'send_email',
            inputSchema: [],
          }),
          expect.objectContaining({ position: 1, toolName: 'create_task' }),
        ],
      );
    });

    // What already ran, was skipped, or is running right now is not the new
    // plan's to rewrite
    it('should replace only the unclaimed proposed calls when folding a new plan in', async () => {
      inboxItemRepository.findOne.mockResolvedValue(buildInboxItem());
      inboxItemToolCallRepository.find.mockResolvedValue([
        { position: 0 },
        { position: 1 },
      ]);

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        subject: threadSubject,
        toolCalls: [
          { toolName: 'send_email', label: 'Send email', proposedInput: {} },
        ],
      });

      expect(inboxItemRepository.findOne).toHaveBeenLastCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      expect(inboxItemToolCallRepository.delete).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          inboxItemId: EXISTING_ITEM_ID,
          status: 'PROPOSED',
        }),
      );
      expect(inboxItemToolCallRepository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        [expect.objectContaining({ position: 2, toolName: 'send_email' })],
      );
    });

    it('should keep an explicitly requested priority when folding rather than the type default', async () => {
      inboxItemRepository.findOne.mockResolvedValue(buildInboxItem());

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'An urgent message',
        priority: InboxItemPriority.NEEDS_ACTION,
        subject: threadSubject,
      });

      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EXISTING_ITEM_ID },
        expect.objectContaining({ priority: InboxItemPriority.NEEDS_ACTION }),
      );
    });
  });

  describe('routeItem concurrency recovery', () => {
    it('should fold into the row the other producer created when the insert hits a unique violation', async () => {
      const concurrentItem = buildInboxItem({ id: 'concurrent-item-id' });

      inboxItemRepository.insertAndReturnOne.mockImplementationOnce(() => {
        // The other producer's row lands between our lookup and our insert
        inboxItemRepository.findOne.mockResolvedValue(concurrentItem);

        return Promise.reject(buildUniqueViolation());
      });
      inboxItemRepository.findOneBy.mockResolvedValue(concurrentItem);

      const result = await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledTimes(1);
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'concurrent-item-id' },
        expect.objectContaining({ title: 'A message from Alice' }),
      );
      expect(result).toEqual(concurrentItem);
    });

    it('should rethrow when the insert fails for a reason other than a unique violation', async () => {
      inboxItemRepository.insertAndReturnOne.mockRejectedValueOnce(
        new Error('connection lost'),
      );

      await expect(
        service.routeItem({
          workspaceId: WORKSPACE_ID,
          typeKey: 'conversation',
          title: 'A message from Alice',
          subject: threadSubject,
        }),
      ).rejects.toThrow('connection lost');
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    it('should rethrow when the unique violation leaves no row behind', async () => {
      inboxItemRepository.insertAndReturnOne.mockRejectedValueOnce(
        buildUniqueViolation(),
      );

      await expect(
        service.routeItem({
          workspaceId: WORKSPACE_ID,
          typeKey: 'conversation',
          title: 'A message from Alice',
          subject: threadSubject,
        }),
      ).rejects.toThrow('duplicate key');
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('routeItem assignee resolution', () => {
    it('should throw when the type key is unknown', async () => {
      inboxItemTypeService.findByKey.mockResolvedValue(null);

      await expect(
        service.routeItem({
          workspaceId: WORKSPACE_ID,
          typeKey: 'not_a_type',
          title: 'A message from Alice',
          subject: threadSubject,
        }),
      ).rejects.toThrow('Unknown inbox item type not_a_type');
      expect(inboxItemRepository.insertAndReturnOne).not.toHaveBeenCalled();
    });

    // Work that no rule can address still has to land somewhere a human can
    // find it.
    it('should send work nobody can be found for to the triage queue', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message nobody owns',
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          queueId: TRIAGE_QUEUE_ID,
          assigneeUserWorkspaceId: null,
        }),
      );
    });

    // The workspace decides where a kind of work goes; the producer only says
    // what happened.
    it('should send work to the queue the type is configured with before triage', async () => {
      inboxItemTypeService.findByKey.mockResolvedValue({
        ...CONVERSATION_TYPE,
        defaultQueueId: SUPPORT_QUEUE_ID,
      });

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message nobody owns',
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ queueId: SUPPORT_QUEUE_ID }),
      );
      expect(inboxQueueService.findOrCreateDefaultQueue).not.toHaveBeenCalled();
    });

    it('should let a producer that named a queue outrank the type default', async () => {
      inboxItemTypeService.findByKey.mockResolvedValue({
        ...CONVERSATION_TYPE,
        defaultQueueId: TRIAGE_QUEUE_ID,
      });

      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A support request',
        target: { kind: 'queue', queueId: SUPPORT_QUEUE_ID },
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ queueId: SUPPORT_QUEUE_ID }),
      );
    });

    it('should address work to the queue a producer named, with nobody holding it', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A support request',
        target: { kind: 'queue', queueId: SUPPORT_QUEUE_ID },
      });

      expect(inboxQueueService.findOrCreateDefaultQueue).not.toHaveBeenCalled();
      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          queueId: SUPPORT_QUEUE_ID,
          assigneeUserWorkspaceId: null,
        }),
      );
    });

    // The slot belongs to the queue, so whoever currently holds the item is
    // irrelevant to whether the next event folds into it
    it('should look a queue slot up by the queue rather than by who holds it', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A second message on the same request',
        slotKey: RUN_SLOT_KEY,
        target: { kind: 'queue', queueId: SUPPORT_QUEUE_ID },
      });

      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: { queueId: SUPPORT_QUEUE_ID, slotKey: RUN_SLOT_KEY },
      });
    });

    it('should prefer the thread owner over the fallback assignee when both are available', async () => {
      await service.routeItem({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
        target: {
          kind: 'userWorkspace',
          userWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        },
      });

      expect(inboxItemRepository.insertAndReturnOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
        }),
      );
    });
  });

  describe('route', () => {
    it('should return the routed item when routing succeeds', async () => {
      const result = await service.route({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      expect(result).toEqual(expect.objectContaining({ id: INSERTED_ITEM_ID }));
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should return null and log a warning instead of throwing when routing fails', async () => {
      inboxItemTypeService.findByKey.mockRejectedValue(
        new Error('metadata unavailable'),
      );

      const result = await service.route({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      expect(result).toBeNull();
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('metadata unavailable'),
      );
    });

    it('should swallow the error that routeItem raises for the same arguments', async () => {
      inboxItemTypeService.findByKey.mockResolvedValue(null);

      const args = {
        workspaceId: WORKSPACE_ID,
        typeKey: 'not_a_type',
        title: 'A message from Alice',
        subject: threadSubject,
      };

      await expect(service.routeItem(args)).rejects.toThrow(
        'Unknown inbox item type not_a_type',
      );
      await expect(service.route(args)).resolves.toBeNull();
    });
  });

  describe('renameThreadItem', () => {
    it('should retitle every item of the thread without touching what happened to it', async () => {
      await service.renameThreadItem({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        title: 'A renamed conversation',
      });

      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { threadId: THREAD_ID },
        { title: 'A renamed conversation' },
      );
      expect(inboxItemRepository.insertAndReturnOne).not.toHaveBeenCalled();
    });
  });

  describe('clearByThreadId', () => {
    it('should clear the thread items with nobody as the actor', async () => {
      await service.clearByThreadId({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
      });

      const [, , partialUpdate] = inboxItemRepository.update.mock.calls[0];

      expect(partialUpdate.clearedAt()).toBe('clock_timestamp()');
      expect(partialUpdate).toEqual(
        expect.objectContaining({
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
        }),
      );
    });
  });
});
