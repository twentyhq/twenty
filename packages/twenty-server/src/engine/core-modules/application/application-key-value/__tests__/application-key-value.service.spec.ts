import { ForbiddenException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IsNull, type Repository } from 'typeorm';

import { AppKeyValueScope } from 'src/engine/core-modules/application/application-key-value/enums/app-key-value-scope.enum';
import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

const OWNER_WORKSPACE_ID = 'workspace-owner';
const OTHER_WORKSPACE_ID = 'workspace-other';
const REGISTRATION_ID = 'registration-1';
const OWNER_INSTALL_ID = 'application-owner-install';
const OTHER_INSTALL_ID = 'application-other-install';

const buildApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    id: OTHER_INSTALL_ID,
    workspaceId: OTHER_WORKSPACE_ID,
    applicationRegistrationId: REGISTRATION_ID,
    ...overrides,
  }) as FlatApplication;

type QueryBuilderMock = {
  insert: jest.Mock;
  into: jest.Mock;
  values: jest.Mock;
  orIgnore: jest.Mock;
  delete: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  execute: jest.Mock;
};

const buildQueryBuilderMock = (): QueryBuilderMock => {
  const queryBuilder = {} as QueryBuilderMock;

  queryBuilder.insert = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.into = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.values = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.orIgnore = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.delete = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.where = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.andWhere = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.execute = jest.fn().mockResolvedValue({ affected: 0 });

  return queryBuilder;
};

describe('ApplicationKeyValueService', () => {
  let service: ApplicationKeyValueService;
  let keyValuePairRepository: jest.Mocked<Repository<KeyValuePairEntity>>;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;
  let applicationRegistrationRepository: jest.Mocked<
    Repository<ApplicationRegistrationEntity>
  >;
  let queryBuilder: QueryBuilderMock;

  beforeEach(async () => {
    queryBuilder = buildQueryBuilderMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationKeyValueService,
        {
          provide: getRepositoryToken(KeyValuePairEntity),
          useValue: {
            findOne: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationKeyValueService);
    keyValuePairRepository = module.get(getRepositoryToken(KeyValuePairEntity));
    applicationRepository = module.get(getRepositoryToken(ApplicationEntity));
    applicationRegistrationRepository = module.get(
      getRepositoryToken(ApplicationRegistrationEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockRegistrationWithOwner = () => {
    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: REGISTRATION_ID,
      ownerWorkspaceId: OWNER_WORKSPACE_ID,
    } as ApplicationRegistrationEntity);
    applicationRepository.findOne.mockResolvedValue({
      id: OWNER_INSTALL_ID,
    } as ApplicationEntity);
  };

  describe('get', () => {
    it('should scope INSTALL reads to the caller install and workspace', async () => {
      keyValuePairRepository.findOne.mockResolvedValue({
        value: 'stored-value',
      } as unknown as KeyValuePairEntity);

      const result = await service.get({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'my-key',
        scope: AppKeyValueScope.INSTALL,
      });

      expect(keyValuePairRepository.findOne).toHaveBeenCalledWith({
        where: {
          key: 'my-key',
          applicationId: OTHER_INSTALL_ID,
          workspaceId: OTHER_WORKSPACE_ID,
          type: KeyValuePairType.APPLICATION_VARIABLE,
        },
      });
      expect(result).toEqual({
        key: 'my-key',
        value: 'stored-value',
        scope: AppKeyValueScope.INSTALL,
      });
    });

    it('should return null when the key is absent', async () => {
      keyValuePairRepository.findOne.mockResolvedValue(null);

      const result = await service.get({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'missing',
        scope: AppKeyValueScope.INSTALL,
      });

      expect(result).toBeNull();
    });

    it('should read GLOBAL entries under the registration owner install', async () => {
      mockRegistrationWithOwner();
      keyValuePairRepository.findOne.mockResolvedValue({
        value: OTHER_WORKSPACE_ID,
      } as unknown as KeyValuePairEntity);

      const result = await service.get({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'slack:team:T123',
        scope: AppKeyValueScope.GLOBAL,
      });

      expect(keyValuePairRepository.findOne).toHaveBeenCalledWith({
        where: {
          key: 'slack:team:T123',
          applicationId: OWNER_INSTALL_ID,
          workspaceId: IsNull(),
          type: KeyValuePairType.APPLICATION_VARIABLE,
        },
      });
      expect(result?.value).toBe(OTHER_WORKSPACE_ID);
    });

    it('should fall back to the caller install for unregistered apps', async () => {
      keyValuePairRepository.findOne.mockResolvedValue(null);

      await service.get({
        application: buildApplication({ applicationRegistrationId: null }),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'some-key',
        scope: AppKeyValueScope.GLOBAL,
      });

      expect(applicationRegistrationRepository.findOne).not.toHaveBeenCalled();
      expect(keyValuePairRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({ applicationId: OTHER_INSTALL_ID }),
      });
    });
  });

  describe('set', () => {
    it('should upsert INSTALL entries against the install unique index', async () => {
      const result = await service.set({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'my-key',
        value: { nested: true },
        scope: AppKeyValueScope.INSTALL,
      });

      expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
        {
          key: 'my-key',
          value: { nested: true },
          applicationId: OTHER_INSTALL_ID,
          workspaceId: OTHER_WORKSPACE_ID,
          userId: null,
          type: KeyValuePairType.APPLICATION_VARIABLE,
        },
        {
          conflictPaths: ['key', 'applicationId'],
          indexPredicate:
            '"applicationId" IS NOT NULL AND "workspaceId" IS NOT NULL',
        },
      );
      expect(result).toEqual({
        key: 'my-key',
        value: { nested: true },
        scope: AppKeyValueScope.INSTALL,
      });
    });

    it('should claim a GLOBAL key for the caller workspace', async () => {
      mockRegistrationWithOwner();
      keyValuePairRepository.findOne.mockResolvedValue({
        value: OTHER_WORKSPACE_ID,
      } as unknown as KeyValuePairEntity);

      const result = await service.set({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'slack:team:T123',
        value: undefined,
        scope: AppKeyValueScope.GLOBAL,
      });

      expect(queryBuilder.values).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'slack:team:T123',
          value: OTHER_WORKSPACE_ID,
          applicationId: OWNER_INSTALL_ID,
          workspaceId: null,
        }),
      );
      expect(queryBuilder.orIgnore).toHaveBeenCalled();
      expect(result).toEqual({
        key: 'slack:team:T123',
        value: OTHER_WORKSPACE_ID,
        scope: AppKeyValueScope.GLOBAL,
      });
    });

    it('should reject a GLOBAL key already claimed by another workspace', async () => {
      mockRegistrationWithOwner();
      keyValuePairRepository.findOne.mockResolvedValue({
        value: OWNER_WORKSPACE_ID,
      } as unknown as KeyValuePairEntity);

      await expect(
        service.set({
          application: buildApplication(),
          workspaceId: OTHER_WORKSPACE_ID,
          key: 'slack:team:T123',
          value: undefined,
          scope: AppKeyValueScope.GLOBAL,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject a GLOBAL value that is not the caller workspaceId', async () => {
      await expect(
        service.set({
          application: buildApplication(),
          workspaceId: OTHER_WORKSPACE_ID,
          key: 'slack:team:T123',
          value: 'some-arbitrary-value',
          scope: AppKeyValueScope.GLOBAL,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(queryBuilder.insert).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete INSTALL entries scoped to the caller install', async () => {
      keyValuePairRepository.delete.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      const result = await service.delete({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'my-key',
        scope: AppKeyValueScope.INSTALL,
      });

      expect(keyValuePairRepository.delete).toHaveBeenCalledWith({
        key: 'my-key',
        applicationId: OTHER_INSTALL_ID,
        workspaceId: OTHER_WORKSPACE_ID,
        type: KeyValuePairType.APPLICATION_VARIABLE,
      });
      expect(result).toBe(true);
    });

    it('should only release a GLOBAL claim owned by the caller workspace', async () => {
      mockRegistrationWithOwner();
      queryBuilder.execute.mockResolvedValue({ affected: 0 });

      const result = await service.delete({
        application: buildApplication(),
        workspaceId: OTHER_WORKSPACE_ID,
        key: 'slack:team:T123',
        scope: AppKeyValueScope.GLOBAL,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '"value" = :value::jsonb',
        { value: JSON.stringify(OTHER_WORKSPACE_ID) },
      );
      expect(result).toBe(false);
    });
  });
});
