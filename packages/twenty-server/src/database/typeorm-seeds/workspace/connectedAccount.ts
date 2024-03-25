import { DataSource } from 'typeorm';

const tableName = 'connectedAccount';

export const seedConnectedAccount = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
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
      id: '6773281b-9ac0-4390-9a1a-ab4d2c4e1bb7',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lastSyncHistoryId: 'exampleLastSyncHistory',
      accountOwnerId: '20202020-0687-4c41-b707-ed1bfca972a7',
      refreshToken: 'exampleRefreshToken',
      accessToken: 'exampleAccessToken',
      provider: 'google',
      handle: 'incoming',
    },
    {
      id: '67373de8-0cc8-4d60-a3a4-803245698908',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lastSyncHistoryId: 'exampleLastSyncHistory',
      accountOwnerId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
      refreshToken: 'exampleRefreshToken',
      accessToken: 'exampleAccessToken',
      provider: 'google',
      handle: 'incoming',
    },
    {
      id: 'f2a8cf93-cafc-4323-908d-e5b42ad69fdf',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      lastSyncHistoryId: 'exampleLastSyncHistory',
      accountOwnerId: '20202020-1553-45c6-a028-5a9064cce07f',
      refreshToken: 'exampleRefreshToken',
      accessToken: 'exampleAccessToken',
      provider: 'google',
      handle: 'incoming',
    },
    ])
    .execute();
};
