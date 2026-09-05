import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { IsNull } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  INBOX_ITEM_TYPE_KEY,
  STANDARD_INBOX_ITEM_TYPES,
} from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'twenty-standard-application-id';
const QUEUE_ID = 'inbox-queue-id';

const existingType = {
  id: 'inbox-item-type-id',
  workspaceId: WORKSPACE_ID,
  key: INBOX_ITEM_TYPE_KEY.conversation,
} as InboxItemTypeEntity;

describe('InboxItemTypeService', () => {
  let service: InboxItemTypeService;

  const inboxItemTypeRepository = {
    findOne: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  };

  const applicationRepository = {
    findOne: jest.fn(),
  };

  const inboxQueueService = {
    findQueueOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    inboxItemTypeRepository.findOne.mockResolvedValue(existingType);
    inboxItemTypeRepository.upsert.mockResolvedValue({ identifiers: [] });
    inboxQueueService.findQueueOrThrow.mockResolvedValue({ id: QUEUE_ID });
    applicationRepository.findOne.mockResolvedValue({ id: APPLICATION_ID });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxItemTypeService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemTypeEntity),
          useValue: inboxItemTypeRepository,
        },
        {
          // ApplicationEntity is an exempted cross-workspace lookup, so it
          // stays on the raw repository
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: InboxQueueService,
          useValue: inboxQueueService,
        },
      ],
    }).compile();

    service = module.get<InboxItemTypeService>(InboxItemTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByKey', () => {
    it('should return the existing type without seeding when the key already exists', async () => {
      const result = await service.findByKey({
        workspaceId: WORKSPACE_ID,
        key: INBOX_ITEM_TYPE_KEY.conversation,
      });

      expect(result).toEqual(existingType);
      expect(inboxItemTypeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(inboxItemTypeRepository.findOne).toHaveBeenCalledWith(
        WORKSPACE_ID,
        {
          where: {
            key: INBOX_ITEM_TYPE_KEY.conversation,
            deletedAt: IsNull(),
          },
        },
      );
      expect(inboxItemTypeRepository.upsert).not.toHaveBeenCalled();
      expect(applicationRepository.findOne).not.toHaveBeenCalled();
    });

    it('should seed the standard types and retry when the key is missing', async () => {
      inboxItemTypeRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingType);

      const result = await service.findByKey({
        workspaceId: WORKSPACE_ID,
        key: INBOX_ITEM_TYPE_KEY.conversation,
      });

      expect(inboxItemTypeRepository.upsert).toHaveBeenCalledTimes(1);
      expect(inboxItemTypeRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(existingType);
    });

    it('should not seed for a key that is not a standard type', async () => {
      inboxItemTypeRepository.findOne.mockResolvedValue(null);

      const result = await service.findByKey({
        workspaceId: WORKSPACE_ID,
        key: 'not_a_standard_type',
      });

      expect(result).toBeNull();
      expect(inboxItemTypeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(inboxItemTypeRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('seedStandardTypes', () => {
    it('should upsert every standard type against the twenty standard application when it is present', async () => {
      await service.seedStandardTypes({ workspaceId: WORKSPACE_ID });

      expect(applicationRepository.findOne).toHaveBeenCalledWith({
        where: {
          workspaceId: WORKSPACE_ID,
          universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      });

      const [upsertWorkspaceId, upsertedTypes, upsertOptions] =
        inboxItemTypeRepository.upsert.mock.calls[0];

      expect(upsertWorkspaceId).toBe(WORKSPACE_ID);
      expect(upsertedTypes).toHaveLength(STANDARD_INBOX_ITEM_TYPES.length);
      expect(upsertedTypes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            applicationId: APPLICATION_ID,
            key: INBOX_ITEM_TYPE_KEY.conversation,
          }),
          expect.objectContaining({
            applicationId: APPLICATION_ID,
            key: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
          }),
        ]),
      );
      // Identity is (workspaceId, universalIdentifier), which is what makes
      // re-running the seed idempotent
      expect(upsertOptions).toEqual({
        conflictPaths: ['workspaceId', 'universalIdentifier'],
      });
    });

    it('should do nothing when the twenty standard application row is absent', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await service.seedStandardTypes({ workspaceId: WORKSPACE_ID });

      expect(inboxItemTypeRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('setDefaultQueue', () => {
    // The queue lookup is workspace-scoped, so a queue from another workspace
    // cannot become an address this workspace can no longer see into
    it('should reject a queue that does not belong to this workspace', async () => {
      inboxQueueService.findQueueOrThrow.mockRejectedValue(
        new Error('Inbox queue not found'),
      );

      const setDefaultQueue = service.setDefaultQueue({
        workspaceId: WORKSPACE_ID,
        inboxItemTypeId: existingType.id,
        defaultQueueId: QUEUE_ID,
      });

      await expect(setDefaultQueue).rejects.toThrow();
      expect(inboxItemTypeRepository.update).not.toHaveBeenCalled();
    });

    it('should leave a type that no longer exists untouched', async () => {
      inboxItemTypeRepository.findOne.mockResolvedValue(null);

      const setDefaultQueue = service.setDefaultQueue({
        workspaceId: WORKSPACE_ID,
        inboxItemTypeId: existingType.id,
        defaultQueueId: null,
      });

      await expect(setDefaultQueue).rejects.toThrow();
      expect(inboxItemTypeRepository.update).not.toHaveBeenCalled();
    });

    it('should write the queue once both are verified', async () => {
      await service.setDefaultQueue({
        workspaceId: WORKSPACE_ID,
        inboxItemTypeId: existingType.id,
        defaultQueueId: QUEUE_ID,
      });

      expect(inboxItemTypeRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: existingType.id },
        { defaultQueueId: QUEUE_ID },
      );
    });
  });
});
