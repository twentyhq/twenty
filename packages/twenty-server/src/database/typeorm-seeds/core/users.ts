import { DataSource } from 'typeorm';

// import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'user';

export enum SeedUserIds {
  Tim = '20202020-9e3b-46d4-a556-88b9ddc2b034',
  Jony = '20202020-3957-4908-9c36-2929a23f8357',
  Phil = '20202020-7169-42cf-bc47-1cfef15264b8',
}

export const seedUsers = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'firstName',
      'lastName',
      'email',
      'passwordHash',
      'defaultWorkspaceId',
    ])
    .orIgnore()
    .values([
      {
        id: SeedUserIds.Tim,
        firstName: 'امیر',
        lastName: 'عزیزی',
        email: 'amir@taba.dev',
        passwordHash:
          '$2b$10$3nBfHtGZYyxEFa3r9rGmg.XC73FzrxwSkC.DkJKi0KZ1It9nWMxqK', // 123456Aa
        defaultWorkspaceId: workspaceId,
      },
      {
        id: SeedUserIds.Jony,
        firstName: 'بهنام',
        lastName: 'مقدسیان',
        email: 'behnam@taba.dev',
        passwordHash:
          '$2b$10$3nBfHtGZYyxEFa3r9rGmg.XC73FzrxwSkC.DkJKi0KZ1It9nWMxqK', // 123456Aa
        defaultWorkspaceId: workspaceId,
      },
      ,
      {
        id: SeedUserIds.Phil,
        firstName: 'امیرحسین',
        lastName: 'عبدالله زاده',
        email: 'amirhossein@taba.dev',
        passwordHash:
          '$2b$10$3nBfHtGZYyxEFa3r9rGmg.XC73FzrxwSkC.DkJKi0KZ1It9nWMxqK', // 123456Aa
        defaultWorkspaceId: workspaceId,
      },
    ])
    .execute();
};

export const deleteUsersByWorkspace = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."defaultWorkspaceId" = :workspaceId`, {
      workspaceId,
    })
    .execute();
};
