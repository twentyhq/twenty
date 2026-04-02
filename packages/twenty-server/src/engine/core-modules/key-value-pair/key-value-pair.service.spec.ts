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
      findOne: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      upsert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<KeyValuePairEntity>>;

    service = new KeyValuePairService(keyValuePairRepository);
  });

  it('should insert a global null/null key when missing', async () => {
    await service.set({
      userId: null,
      workspaceId: null,
      key: 'MAINTENANCE_MODE',
      value: { startAt: '2026-04-02T10:00:00.000Z' },
      type: KeyValuePairType.CONFIG_VARIABLE,
    });

    expect(keyValuePairRepository.findOne).toHaveBeenCalledWith({
      where: {
        userId: expect.any(Object),
        workspaceId: expect.any(Object),
        key: 'MAINTENANCE_MODE',
        type: KeyValuePairType.CONFIG_VARIABLE,
      },
    });
    expect(keyValuePairRepository.insert).toHaveBeenCalledWith({
      userId: null,
      workspaceId: null,
      key: 'MAINTENANCE_MODE',
      value: { startAt: '2026-04-02T10:00:00.000Z' },
      type: KeyValuePairType.CONFIG_VARIABLE,
    });
    expect(keyValuePairRepository.upsert).not.toHaveBeenCalled();
  });

  it('should update a global null/null key when present', async () => {
    keyValuePairRepository.findOne.mockResolvedValue({
      id: 'existing-id',
    } as KeyValuePairEntity);

    await service.set({
      userId: null,
      workspaceId: null,
      key: 'MAINTENANCE_MODE',
      value: { startAt: '2026-04-02T10:00:00.000Z' },
      type: KeyValuePairType.CONFIG_VARIABLE,
    });

    expect(keyValuePairRepository.update).toHaveBeenCalledWith('existing-id', {
      value: { startAt: '2026-04-02T10:00:00.000Z' },
    });
    expect(keyValuePairRepository.insert).not.toHaveBeenCalled();
    expect(keyValuePairRepository.upsert).not.toHaveBeenCalled();
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
