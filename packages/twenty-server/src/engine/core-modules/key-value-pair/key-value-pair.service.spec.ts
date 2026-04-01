import { type Repository } from 'typeorm';

import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

import { KeyValuePairService } from './key-value-pair.service';

describe('KeyValuePairService', () => {
  let service: KeyValuePairService;
  let keyValuePairRepository: jest.Mocked<Repository<KeyValuePairEntity>>;

  beforeEach(() => {
    keyValuePairRepository = {
      upsert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<KeyValuePairEntity>>;

    service = new KeyValuePairService(keyValuePairRepository);
  });

  it('should use the global null/null unique index', async () => {
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
        key: 'MAINTENANCE_MODE',
        value: { startAt: '2026-04-02T10:00:00.000Z' },
        type: KeyValuePairType.CONFIG_VARIABLE,
      },
      {
        conflictPaths: ['key'],
        indexPredicate: '"userId" is NULL AND "workspaceId" is NULL',
      },
    );
  });

  it('should keep the existing workspace-null index behavior', async () => {
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
        key: 'USER_SETTING',
        value: true,
        type: KeyValuePairType.USER_VARIABLE,
      },
      {
        conflictPaths: ['userId', 'workspaceId', 'key'],
        indexPredicate: '"workspaceId" is NULL',
      },
    );
  });
});
