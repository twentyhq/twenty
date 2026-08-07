import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { isDefined } from 'twenty-shared/utils';

import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemBinding } from 'src/engine/core-modules/inbox/enums/inbox-item-binding.enum';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const THREAD_OWNER_USER_WORKSPACE_ID = 'thread-owner-user-workspace-id';
const FALLBACK_USER_WORKSPACE_ID = 'fallback-user-workspace-id';
const SUBJECT_TYPE_ID = 'subject-type-id';
const OCCURRENCE_TYPE_ID = 'occurrence-type-id';
const EXISTING_ITEM_ID = 'existing-item-id';
const INSERTED_ITEM_ID = 'inserted-item-id';
const THREAD_DEDUPE_KEY = `thread:${THREAD_ID}`;
const OCCURRENCE_DEDUPE_KEY = 'workflow-run:run-id';

const SUBJECT_TYPE = {
  id: SUBJECT_TYPE_ID,
  key: 'conversation',
  label: 'Conversation',
  binding: InboxItemBinding.SUBJECT,
  defaultPriority: InboxItemPriority.LOW,
} as InboxItemTypeEntity;

const OCCURRENCE_TYPE = {
  id: OCCURRENCE_TYPE_ID,
  key: 'workflow_run_failed',
  label: 'Workflow run failed',
  binding: InboxItemBinding.OCCURRENCE,
  defaultPriority: InboxItemPriority.NEEDS_ACTION,
} as InboxItemTypeEntity;

const buildInboxItem = (
  overrides: Partial<InboxItemEntity> = {},
): InboxItemEntity =>
  ({
    id: EXISTING_ITEM_ID,
    workspaceId: WORKSPACE_ID,
    inboxItemTypeId: SUBJECT_TYPE_ID,
    status: InboxItemStatus.OPEN,
    priority: InboxItemPriority.LOW,
    title: 'An older message',
    assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
    dedupeKey: THREAD_DEDUPE_KEY,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
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
    save: jest.fn(),
    update: jest.fn(),
  };

  const inboxItemTypeService = {
    findByKey: jest.fn(),
  };

  // Stands in for the rows the dedupe key currently holds, honouring the
  // optional status filter and the updatedAt DESC ordering the service asks for
  const stubFoldableRows = (rows: InboxItemEntity[]) => {
    const rowsByRecency = [...rows].sort(
      (firstRow, secondRow) =>
        secondRow.updatedAt.getTime() - firstRow.updatedAt.getTime(),
    );

    inboxItemRepository.findOne.mockImplementation((_workspaceId, options) =>
      Promise.resolve(
        rowsByRecency.find(
          (row) =>
            !isDefined(options.where.status) ||
            row.status === options.where.status,
        ) ?? null,
      ),
    );
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    inboxItemTypeService.findByKey.mockResolvedValue(SUBJECT_TYPE);
    stubFoldableRows([]);
    inboxItemRepository.findOneBy.mockResolvedValue(null);
    inboxItemRepository.update.mockResolvedValue({ affected: 1 });
    inboxItemRepository.save.mockImplementation((_workspaceId, inboxItem) =>
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
          provide: InboxItemTypeService,
          useValue: inboxItemTypeService,
        },
      ],
    }).compile();

    service = module.get<InboxRouterService>(InboxRouterService);
  });

  afterEach(() => {
    loggerWarnSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('routeOrThrow with a subject bound type', () => {
    it('should insert an item keyed on the subject and assigned to the thread owner when no item exists yet', async () => {
      // Act
      const result = await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        preview: 'Hello there',
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.save).toHaveBeenCalledTimes(1);
      // The workspace scope is the repository's first argument, never a column
      // in the payload
      expect(inboxItemRepository.save).toHaveBeenCalledWith(WORKSPACE_ID, {
        inboxItemTypeId: SUBJECT_TYPE_ID,
        status: InboxItemStatus.OPEN,
        priority: InboxItemPriority.LOW,
        title: 'A message from Alice',
        preview: 'Hello there',
        payload: null,
        assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
        dedupeKey: THREAD_DEDUPE_KEY,
        threadId: THREAD_ID,
        subjectObjectMetadataId: null,
        subjectRecordId: null,
      });
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: INSERTED_ITEM_ID }));
    });

    it('should derive the dedupe key from a record subject when the subject is a record', async () => {
      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A record needs attention',
        fallbackAssigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        subject: {
          kind: 'record',
          objectMetadataId: 'object-metadata-id',
          recordId: 'record-id',
        },
      });

      // Assert
      expect(inboxItemRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          dedupeKey: 'record:object-metadata-id:record-id',
          assigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
          threadId: null,
          subjectObjectMetadataId: 'object-metadata-id',
          subjectRecordId: 'record-id',
        }),
      );
    });

    it('should fold into the existing open item instead of inserting a second one when the subject already has an item', async () => {
      // Prepare
      stubFoldableRows([
        buildInboxItem({
          readAt: new Date('2026-01-01T00:00:00.000Z'),
          snoozedUntil: new Date('2026-02-01T00:00:00.000Z'),
        }),
      ]);
      inboxItemRepository.findOneBy.mockResolvedValue(
        buildInboxItem({ title: 'A newer message', readAt: null }),
      );

      // Act
      const result = await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A newer message',
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).toHaveBeenCalledTimes(1);
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EXISTING_ITEM_ID },
        expect.objectContaining({
          inboxItemTypeId: SUBJECT_TYPE_ID,
          title: 'A newer message',
          priority: InboxItemPriority.LOW,
          status: InboxItemStatus.OPEN,
          snoozedUntil: null,
          readAt: null,
        }),
      );
      expect(inboxItemRepository.findOneBy).toHaveBeenCalledWith(WORKSPACE_ID, {
        id: EXISTING_ITEM_ID,
      });
      expect(result).toEqual(
        expect.objectContaining({ title: 'A newer message' }),
      );
    });

    it('should fall back to the type label when the producer sends no title', async () => {
      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ title: 'Conversation' }),
      );
    });

    it('should leave the title, preview and payload untouched when folding without them', async () => {
      // Prepare
      stubFoldableRows([
        buildInboxItem({ title: 'An older message', preview: 'Hello there' }),
      ]);

      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        subject: threadSubject,
      });

      // Assert
      const [, , partialUpdate] = inboxItemRepository.update.mock.calls[0];

      expect(partialUpdate).not.toHaveProperty('title');
      expect(partialUpdate).not.toHaveProperty('preview');
      expect(partialUpdate).not.toHaveProperty('payload');
      expect(partialUpdate).toEqual(
        expect.objectContaining({
          status: InboxItemStatus.OPEN,
          snoozedUntil: null,
          readAt: null,
        }),
      );
    });

    it('should keep an explicitly requested priority when folding rather than the type default', async () => {
      // Prepare
      stubFoldableRows([buildInboxItem()]);

      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'An urgent message',
        priority: InboxItemPriority.NEEDS_ACTION,
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EXISTING_ITEM_ID },
        expect.objectContaining({ priority: InboxItemPriority.NEEDS_ACTION }),
      );
    });

    it('should fall back to an any status lookup so a resolved subject can be revived', async () => {
      // Prepare
      stubFoldableRows([
        buildInboxItem({
          status: InboxItemStatus.DONE,
          resolvedAt: new Date('2026-01-01T00:00:00.000Z'),
          resolvedByUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
        }),
      ]);

      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A reply on a resolved conversation',
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.findOne).toHaveBeenNthCalledWith(
        1,
        WORKSPACE_ID,
        {
          where: {
            assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
            dedupeKey: THREAD_DEDUPE_KEY,
            status: InboxItemStatus.OPEN,
          },
          order: { updatedAt: 'DESC' },
        },
      );
      expect(inboxItemRepository.findOne).toHaveBeenNthCalledWith(
        2,
        WORKSPACE_ID,
        {
          where: {
            assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
            dedupeKey: THREAD_DEDUPE_KEY,
          },
          order: { updatedAt: 'DESC' },
        },
      );
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EXISTING_ITEM_ID },
        expect.objectContaining({
          status: InboxItemStatus.OPEN,
          resolvedAt: null,
          resolvedByUserWorkspaceId: null,
          readAt: null,
          snoozedUntil: null,
        }),
      );
    });

    it('should fold into the open item when a more recently updated done item shares the dedupe key', async () => {
      // Prepare
      // Reviving the done row instead would leave two open rows on one key and
      // collide on IDX_INBOX_ITEM_DEDUPE_KEY_OPEN_UNIQUE
      stubFoldableRows([
        buildInboxItem({
          id: 'open-item-id',
          status: InboxItemStatus.OPEN,
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        buildInboxItem({
          id: 'done-item-id',
          status: InboxItemStatus.DONE,
          updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        }),
      ]);

      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A reply on a conversation that also has a resolved item',
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.findOne).toHaveBeenCalledTimes(1);
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'open-item-id' },
        expect.objectContaining({ status: InboxItemStatus.OPEN }),
      );
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
    });

    it('should throw when the type is subject bound and no subject is given', async () => {
      // Act & Assert
      await expect(
        service.routeOrThrow({
          workspaceId: WORKSPACE_ID,
          typeKey: 'conversation',
          title: 'A message with no subject',
          fallbackAssigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        }),
      ).rejects.toThrow(
        'Inbox item type conversation is subject bound and needs a subject',
      );
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('routeOrThrow with an occurrence bound type', () => {
    beforeEach(() => {
      inboxItemTypeService.findByKey.mockResolvedValue(OCCURRENCE_TYPE);
    });

    it('should scope the lookup to open items and fold into one when the occurrence is still open', async () => {
      // Prepare
      stubFoldableRows([
        buildInboxItem({
          inboxItemTypeId: OCCURRENCE_TYPE_ID,
          dedupeKey: OCCURRENCE_DEDUPE_KEY,
          assigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
        }),
      ]);

      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'workflow_run_failed',
        title: 'A workflow run failed again',
        dedupeKey: OCCURRENCE_DEDUPE_KEY,
        fallbackAssigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
      });

      // Assert
      expect(inboxItemRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: {
          assigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
          dedupeKey: OCCURRENCE_DEDUPE_KEY,
          status: InboxItemStatus.OPEN,
        },
        order: { updatedAt: 'DESC' },
      });
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EXISTING_ITEM_ID },
        expect.objectContaining({ status: InboxItemStatus.OPEN }),
      );
    });

    it('should insert a new item rather than revive the resolved one when the occurrence is already done', async () => {
      // Prepare
      stubFoldableRows([
        buildInboxItem({
          inboxItemTypeId: OCCURRENCE_TYPE_ID,
          dedupeKey: OCCURRENCE_DEDUPE_KEY,
          assigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
          status: InboxItemStatus.DONE,
        }),
      ]);

      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'workflow_run_failed',
        title: 'A workflow run failed again',
        dedupeKey: OCCURRENCE_DEDUPE_KEY,
        fallbackAssigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
      });

      // Assert
      // An occurrence never falls back to the any status lookup, so the done
      // row stays invisible and a fresh item is created
      expect(inboxItemRepository.findOne).toHaveBeenCalledTimes(1);

      const [, findOneOptions] = inboxItemRepository.findOne.mock.calls[0];

      expect(findOneOptions.where.status).toBe(InboxItemStatus.OPEN);
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
      expect(inboxItemRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          inboxItemTypeId: OCCURRENCE_TYPE_ID,
          dedupeKey: OCCURRENCE_DEDUPE_KEY,
          status: InboxItemStatus.OPEN,
          priority: InboxItemPriority.NEEDS_ACTION,
        }),
      );
    });

    it('should always insert without looking for a foldable item when no dedupe key is given', async () => {
      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'workflow_run_failed',
        title: 'A workflow run failed',
        fallbackAssigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
      });

      // Assert
      expect(inboxItemRepository.findOne).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
      expect(inboxItemRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ dedupeKey: null }),
      );
    });
  });

  describe('routeOrThrow concurrency recovery', () => {
    it('should fold into the row the other producer created when the insert hits a unique violation', async () => {
      // Prepare
      const concurrentItem = buildInboxItem({ id: 'concurrent-item-id' });

      inboxItemRepository.save.mockImplementationOnce(() => {
        // The other producer's row lands between our lookup and our insert
        stubFoldableRows([concurrentItem]);

        return Promise.reject({ code: '23505' });
      });
      inboxItemRepository.findOneBy.mockResolvedValue(concurrentItem);

      // Act
      const result = await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      // Assert
      expect(inboxItemRepository.save).toHaveBeenCalledTimes(1);
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'concurrent-item-id' },
        expect.objectContaining({ title: 'A message from Alice' }),
      );
      expect(result).toEqual(concurrentItem);
    });

    it('should rethrow when the insert fails for a reason other than a unique violation', async () => {
      // Prepare
      inboxItemRepository.save.mockRejectedValueOnce(
        new Error('connection lost'),
      );

      // Act & Assert
      await expect(
        service.routeOrThrow({
          workspaceId: WORKSPACE_ID,
          typeKey: 'conversation',
          title: 'A message from Alice',
          subject: threadSubject,
        }),
      ).rejects.toThrow('connection lost');
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    it('should rethrow when the unique violation leaves no foldable row behind', async () => {
      // Prepare
      inboxItemRepository.save.mockRejectedValueOnce({ code: '23505' });

      // Act & Assert
      await expect(
        service.routeOrThrow({
          workspaceId: WORKSPACE_ID,
          typeKey: 'conversation',
          title: 'A message from Alice',
          subject: threadSubject,
        }),
      ).rejects.toEqual({ code: '23505' });
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('routeOrThrow assignee resolution', () => {
    it('should throw when the type key is unknown', async () => {
      // Prepare
      inboxItemTypeService.findByKey.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.routeOrThrow({
          workspaceId: WORKSPACE_ID,
          typeKey: 'not_a_type',
          title: 'A message from Alice',
          subject: threadSubject,
        }),
      ).rejects.toThrow('Unknown inbox item type not_a_type');
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
    });

    it('should return null without inserting when no thread subject and no fallback assignee resolve a recipient', async () => {
      // Act
      const result = await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message nobody owns',
      });

      // Assert
      expect(result).toBeNull();
      expect(inboxItemRepository.findOne).not.toHaveBeenCalled();
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
      expect(inboxItemRepository.update).not.toHaveBeenCalled();
    });

    it('should prefer the thread owner over the fallback assignee when both are available', async () => {
      // Act
      await service.routeOrThrow({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
        fallbackAssigneeUserWorkspaceId: FALLBACK_USER_WORKSPACE_ID,
      });

      // Assert
      expect(inboxItemRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          assigneeUserWorkspaceId: THREAD_OWNER_USER_WORKSPACE_ID,
        }),
      );
    });
  });

  describe('route', () => {
    it('should return the routed item when routing succeeds', async () => {
      // Act
      const result = await service.route({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      // Assert
      expect(result).toEqual(expect.objectContaining({ id: INSERTED_ITEM_ID }));
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should return null and log a warning instead of throwing when routing fails', async () => {
      // Prepare
      inboxItemTypeService.findByKey.mockRejectedValue(
        new Error('metadata unavailable'),
      );

      // Act
      const result = await service.route({
        workspaceId: WORKSPACE_ID,
        typeKey: 'conversation',
        title: 'A message from Alice',
        subject: threadSubject,
      });

      // Assert
      expect(result).toBeNull();
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('metadata unavailable'),
      );
    });

    it('should swallow the error that routeOrThrow raises for the same arguments', async () => {
      // Prepare
      inboxItemTypeService.findByKey.mockResolvedValue(null);

      const args = {
        workspaceId: WORKSPACE_ID,
        typeKey: 'not_a_type',
        title: 'A message from Alice',
        subject: threadSubject,
      };

      // Act & Assert
      await expect(service.routeOrThrow(args)).rejects.toThrow(
        'Unknown inbox item type not_a_type',
      );
      await expect(service.route(args)).resolves.toBeNull();
    });
  });

  describe('renameThreadItem', () => {
    it('should retitle every item of the thread without resurfacing or rereading it', async () => {
      // Act
      await service.renameThreadItem({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        title: 'A renamed conversation',
      });

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { threadId: THREAD_ID },
        expect.objectContaining({ title: 'A renamed conversation' }),
      );

      const [, , partialUpdate] = inboxItemRepository.update.mock.calls[0];

      // The list stays ordered by real activity, so the rename freezes updatedAt
      expect(partialUpdate.updatedAt()).toBe('"updatedAt"');

      // A rename is not an attention event, so nothing else may move
      expect(partialUpdate).not.toHaveProperty('status');
      expect(partialUpdate).not.toHaveProperty('readAt');
      expect(partialUpdate).not.toHaveProperty('snoozedUntil');
      expect(partialUpdate).not.toHaveProperty('inboxItemTypeId');
      expect(inboxItemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('dismissByThreadId', () => {
    it('should dismiss only the open items of the thread', async () => {
      // Act
      await service.dismissByThreadId({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
      });

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { threadId: THREAD_ID, status: InboxItemStatus.OPEN },
        expect.objectContaining({ status: InboxItemStatus.DISMISSED }),
      );
    });
  });
});
