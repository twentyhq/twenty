import { DataSource } from 'typeorm';

import { SeedUserIds } from 'src/database/typeorm-seeds/core/users';

const tableName = 'workspaceMember';

const WorkspaceMemberIds = {
  Tim: '20202020-0687-4c41-b707-ed1bfca972a7',
  Jony: '20202020-77d5-4cb6-b60a-f4a835a85d61',
  Phil: '20202020-1553-45c6-a028-5a9064cce07f',
};

export const seedWorkspaceMember = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'locale',
      'colorScheme',
      'userEmail',
      'userId',
    ])
    .orIgnore()
    .values([
      {
        id: WorkspaceMemberIds.Tim,
        nameFirstName: 'Tim',
        nameLastName: 'Apple',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'tim@apple.dev',
        userId: SeedUserIds.Tim,
      },
      {
        id: WorkspaceMemberIds.Jony,
        nameFirstName: 'Jony',
        nameLastName: 'Ive',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'jony.ive@apple.dev',
        userId: SeedUserIds.Jony,
      },
      {
        id: WorkspaceMemberIds.Phil,
        nameFirstName: 'Phil',
        nameLastName: 'Shiler',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'phil.schiler@apple.dev',
        userId: SeedUserIds.Phil,
      },
    ])
    .execute();
};
