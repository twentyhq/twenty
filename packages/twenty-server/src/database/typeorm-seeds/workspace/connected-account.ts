import { EntityManager } from 'typeorm';

import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';

const tableName = 'connectedAccount';

export const DEV_SEED_CONNECTED_ACCOUNT_IDS = {
  TIM: '20202020-9ac0-4390-9a1a-ab4d2c4e1bb7',
  JONY: '20202020-0cc8-4d60-a3a4-803245698908',
  PHIL: '20202020-cafc-4323-908d-e5b42ad69fdf',
};

export const seedConnectedAccount = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'lastSyncHistoryId',
      'accountOwnerId',
      'refreshToken',
      'accessToken',
      'provider',
      'handle',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_CONNECTED_ACCOUNT_IDS.TIM,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lastSyncHistoryId: 'exampleLastSyncHistory',
        accountOwnerId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        refreshToken: 'exampleRefreshToken',
        accessToken: 'exampleAccessToken',
        provider: 'google',
        handle: 'tim@apple.dev',
      },
      {
        id: DEV_SEED_CONNECTED_ACCOUNT_IDS.JONY,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lastSyncHistoryId: 'exampleLastSyncHistory',
        accountOwnerId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
        refreshToken: 'exampleRefreshToken',
        accessToken: 'exampleAccessToken',
        provider: 'google',
        handle: 'jony.ive@apple.dev',
      },
      {
        id: DEV_SEED_CONNECTED_ACCOUNT_IDS.PHIL,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lastSyncHistoryId: 'exampleLastSyncHistory',
        accountOwnerId: DEV_SEED_WORKSPACE_MEMBER_IDS.PHIL,
        refreshToken: 'exampleRefreshToken',
        accessToken: 'exampleAccessToken',
        provider: 'google',
        handle: 'phil.schiler@apple.dev',
      },
    ])
    .execute();
};
