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
import { InboxItemBinding } from 'src/engine/core-modules/inbox/enums/inbox-item-binding.enum';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'twenty-standard-application-id';

const existingType = {
  id: 'inbox-item-type-id',
  workspaceId: WORKSPACE_ID,
  key: INBOX_ITEM_TYPE_KEY.conversation,
  binding: InboxItemBinding.SUBJECT,
} as InboxItemTypeEntity;

describe('InboxItemTypeService', () => {
  let service: InboxItemTypeService;

  const inboxItemTypeRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    upsert: jest.fn(),
  };

  const applicationRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    inboxItemTypeRepository.findOne.mockResolvedValue(existingType);
    inboxItemTypeRepository.find.mockResolvedValue([existingType]);
    inboxItemTypeRepository.upsert.mockResolvedValue({ identifiers: [] });
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
      ],
    }).compile();

    service = module.get<InboxItemTypeService>(InboxItemTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByKey', () => {
    it('should return the existing type without seeding when the key already exists', async () => {
      // Act
      const result = await service.findByKey({
        workspaceId: WORKSPACE_ID,
        key: INBOX_ITEM_TYPE_KEY.conversation,
      });

      // Assert
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
      // Prepare
      inboxItemTypeRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingType);

      // Act
      const result = await service.findByKey({
        workspaceId: WORKSPACE_ID,
        key: INBOX_ITEM_TYPE_KEY.conversation,
      });

      // Assert
      expect(inboxItemTypeRepository.upsert).toHaveBeenCalledTimes(1);
      expect(inboxItemTypeRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(existingType);
    });

    it('should return null when the key is still missing after seeding', async () => {
      // Prepare
      inboxItemTypeRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByKey({
        workspaceId: WORKSPACE_ID,
        key: 'not_a_standard_type',
      });

      // Assert
      expect(result).toBeNull();
      expect(inboxItemTypeRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('seedStandardTypes', () => {
    it('should upsert every standard type against the twenty standard application when it is present', async () => {
      // Act
      await service.seedStandardTypes({ workspaceId: WORKSPACE_ID });

      // Assert
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
            binding: InboxItemBinding.SUBJECT,
          }),
          expect.objectContaining({
            applicationId: APPLICATION_ID,
            key: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
            binding: InboxItemBinding.OCCURRENCE,
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
      // Prepare
      applicationRepository.findOne.mockResolvedValue(null);

      // Act
      await service.seedStandardTypes({ workspaceId: WORKSPACE_ID });

      // Assert
      expect(inboxItemTypeRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return the workspace types that are not soft deleted', async () => {
      // Act
      const result = await service.findAll({ workspaceId: WORKSPACE_ID });

      // Assert
      expect(inboxItemTypeRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: { deletedAt: IsNull() },
      });
      expect(result).toEqual([existingType]);
    });
  });
});
