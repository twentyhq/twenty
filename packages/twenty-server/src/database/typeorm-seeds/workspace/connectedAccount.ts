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
      'accessToken',
      'accountOwnerId',
      'deletedAt',
      'handle',
      'lastSyncHistoryId',
      'provider',
      'refreshToken',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: '6773281b-9ac0-4390-9a1a-ab4d2c4e1bb7',
        createdAt: new Date(),
        accessToken: 'exampleAccessToken',
        accountOwnerId: '20202020-0687-4c41-b707-ed1bfca972a7',
        deletedAt: null,
        handle: 'incoming',
        lastSyncHistoryId: 'exampleLastSyncHistory',
        provider: 'google',
        refreshToken: 'exampleRefreshToken',
        updatedAt: new Date(),
      },
      {
        id: '67373de8-0cc8-4d60-a3a4-803245698908',
        createdAt: new Date(),
        accessToken: 'exampleAccessToken',
        accountOwnerId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        deletedAt: null,
        handle: 'incoming',
        lastSyncHistoryId: 'exampleLastSyncHistory',
        provider: 'google',
        refreshToken: 'exampleRefreshToken',
        updatedAt: new Date(),
      },
      {
        id: 'f2a8cf93-cafc-4323-908d-e5b42ad69fdf',
        createdAt: new Date(),
        accessToken: 'exampleAccessToken',
        accountOwnerId: '20202020-1553-45c6-a028-5a9064cce07f',
        deletedAt: null,
        handle: 'incoming',
        lastSyncHistoryId: 'exampleLastSyncHistory',
        provider: 'google',
        refreshToken: 'exampleRefreshToken',
        updatedAt: new Date(),
      },
    ])
    .execute();
};
