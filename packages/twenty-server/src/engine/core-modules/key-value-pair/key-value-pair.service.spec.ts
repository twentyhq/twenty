import { type Repository } from 'typeorm';

import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

import { KeyValuePairService } from './key-value-pair.service';

const buildQueryBuilderMock = (executeResult?: {
  affected?: number | null;
}) => ({
  insert: jest.fn().mockReturnThis(),
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  orIgnore: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(executeResult),
});

describe('KeyValuePairService', () => {
  let service: KeyValuePairService;
  let keyValuePairRepository: jest.Mocked<Repository<KeyValuePairEntity>>;

  beforeEach(() => {
    keyValuePairRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      upsert: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<KeyValuePairEntity>>;

    service = new KeyValuePairService(keyValuePairRepository);
  });

  it('should upsert a global null/null key', async () => {
    await service.set({
      userId: null,
      workspaceId: null,
      key: 'MAINTENANCE_MODE',
      value: { startAt: '2026-04-02T10:00:00.000Z' },
      type: KeyValuePairType.CONFIG_VARIABLE,
    });

    expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
      {
        userId: null,
        workspaceId: null,
        applicationId: null,
        key: 'MAINTENANCE_MODE',
        value: { startAt: '2026-04-02T10:00:00.000Z' },
        type: KeyValuePairType.CONFIG_VARIABLE,
      },
      {
        conflictPaths: ['key'],
        indexPredicate:
          '"userId" IS NULL AND "workspaceId" IS NULL AND "applicationId" IS NULL',
      },
    );
    expect(keyValuePairRepository.findOne).not.toHaveBeenCalled();
    expect(keyValuePairRepository.insert).not.toHaveBeenCalled();
  });

  it('should upsert with userId-null index when workspaceId is null', async () => {
    await service.set({
      userId: 'user-id',
      workspaceId: null,
      key: 'USER_SETTING',
      value: true,
      type: KeyValuePairType.USER_VARIABLE,
    });

    expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
      {
        userId: 'user-id',
        workspaceId: null,
        applicationId: null,
        key: 'USER_SETTING',
        value: true,
        type: KeyValuePairType.USER_VARIABLE,
      },
      {
        conflictPaths: ['key', 'userId'],
        indexPredicate: '"workspaceId" IS NULL',
      },
    );
  });

  it('should upsert with workspaceId-null index when userId is null', async () => {
    await service.set({
      userId: null,
      workspaceId: 'workspace-id',
      key: 'WORKSPACE_SETTING',
      value: 'test',
      type: KeyValuePairType.CONFIG_VARIABLE,
    });

    expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
      {
        userId: null,
        workspaceId: 'workspace-id',
        applicationId: null,
        key: 'WORKSPACE_SETTING',
        value: 'test',
        type: KeyValuePairType.CONFIG_VARIABLE,
      },
      {
        conflictPaths: ['key', 'workspaceId'],
        indexPredicate: '"userId" IS NULL AND "applicationId" IS NULL',
      },
    );
  });

  it('should upsert a workspace-scoped application key on the (key, applicationId) index', async () => {
    await service.set({
      userId: null,
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      key: 'APP_SETTING',
      value: 'test',
      type: KeyValuePairType.CONFIG_VARIABLE,
    });

    expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        workspaceId: 'workspace-id',
        applicationId: 'application-id',
        key: 'APP_SETTING',
      }),
      {
        conflictPaths: ['key', 'applicationId'],
        indexPredicate:
          '"applicationId" IS NOT NULL AND "workspaceId" IS NOT NULL',
      },
    );
  });

  it('should upsert a server-scoped application key on the global (key, applicationId) index', async () => {
    await service.set({
      userId: null,
      workspaceId: null,
      applicationId: 'application-id',
      key: 'APP_CLAIM',
      value: 'workspace-id',
      type: KeyValuePairType.CONFIG_VARIABLE,
    });

    expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: null,
        applicationId: 'application-id',
        key: 'APP_CLAIM',
      }),
      {
        conflictPaths: ['key', 'applicationId'],
        indexPredicate: '"applicationId" IS NOT NULL AND "workspaceId" IS NULL',
      },
    );
  });

  it('should upsert with full conflict paths when both ids are present', async () => {
    await service.set({
      userId: 'user-id',
      workspaceId: 'workspace-id',
      key: 'USER_WORKSPACE_SETTING',
      value: 42,
      type: KeyValuePairType.USER_VARIABLE,
    });

    expect(keyValuePairRepository.upsert).toHaveBeenCalledWith(
      {
        userId: 'user-id',
        workspaceId: 'workspace-id',
        applicationId: null,
        key: 'USER_WORKSPACE_SETTING',
        value: 42,
        type: KeyValuePairType.USER_VARIABLE,
      },
      {
        conflictPaths: ['key', 'userId', 'workspaceId'],
        indexPredicate: undefined,
      },
    );
  });

  describe('trySetIfAbsent', () => {
    it('should insert with orIgnore and a null applicationId when setting a user workspace key', async () => {
      const queryBuilderMock = buildQueryBuilderMock();

      keyValuePairRepository.createQueryBuilder.mockReturnValue(
        queryBuilderMock as never,
      );

      await service.trySetIfAbsent({
        userId: 'user-id',
        workspaceId: 'workspace-id',
        key: 'WORKSPACE_SETUP_CHAT_THREAD',
        value: { threadId: 'thread-id' },
        type: KeyValuePairType.USER_VARIABLE,
      });

      expect(queryBuilderMock.insert).toHaveBeenCalled();
      expect(queryBuilderMock.into).toHaveBeenCalledWith(KeyValuePairEntity);
      expect(queryBuilderMock.values).toHaveBeenCalledWith({
        userId: 'user-id',
        workspaceId: 'workspace-id',
        applicationId: null,
        key: 'WORKSPACE_SETUP_CHAT_THREAD',
        value: { threadId: 'thread-id' },
        type: KeyValuePairType.USER_VARIABLE,
      });
      expect(queryBuilderMock.orIgnore).toHaveBeenCalled();
      expect(queryBuilderMock.execute).toHaveBeenCalled();
    });
  });

  describe('deleteIfValueEquals', () => {
    const deleteIfValueEquals = () =>
      service.deleteIfValueEquals({
        userId: 'user-id',
        workspaceId: 'workspace-id',
        key: 'WORKSPACE_SETUP_CHAT_THREAD',
        value: { threadId: 'thread-id' },
        type: KeyValuePairType.USER_VARIABLE,
      });

    it('should return true and match on the stringified value when the delete affected a row', async () => {
      const queryBuilderMock = buildQueryBuilderMock({ affected: 1 });

      keyValuePairRepository.createQueryBuilder.mockReturnValue(
        queryBuilderMock as never,
      );

      const result = await deleteIfValueEquals();

      expect(result).toBe(true);
      expect(queryBuilderMock.delete).toHaveBeenCalled();
      expect(queryBuilderMock.from).toHaveBeenCalledWith(KeyValuePairEntity);
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        expect.stringContaining('"applicationId" IS NULL'),
        {
          key: 'WORKSPACE_SETUP_CHAT_THREAD',
          userId: 'user-id',
          workspaceId: 'workspace-id',
          type: KeyValuePairType.USER_VARIABLE,
          value: JSON.stringify({ threadId: 'thread-id' }),
        },
      );
    });

    it('should return false when the delete affected no rows', async () => {
      const queryBuilderMock = buildQueryBuilderMock({ affected: 0 });

      keyValuePairRepository.createQueryBuilder.mockReturnValue(
        queryBuilderMock as never,
      );

      await expect(deleteIfValueEquals()).resolves.toBe(false);
    });

    it('should return false when the driver reports no affected count', async () => {
      const queryBuilderMock = buildQueryBuilderMock({ affected: null });

      keyValuePairRepository.createQueryBuilder.mockReturnValue(
        queryBuilderMock as never,
      );

      await expect(deleteIfValueEquals()).resolves.toBe(false);
    });
  });
});
