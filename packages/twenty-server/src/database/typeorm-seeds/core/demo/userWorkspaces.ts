import { DataSource } from 'typeorm';

const tableName = 'userWorkspace';

export enum DemoSeedUserIds {
  Noah = '20202020-9e3b-46d4-a556-88b9ddc2b035',
  Hugo = '20202020-3957-4908-9c36-2929a23f8358',
  Julia = '20202020-7169-42cf-bc47-1cfef15264b9',
}

export const seedUserWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['userId', 'workspaceId'])
    .orIgnore()
    .values([
      {
        userId: DemoSeedUserIds.Noah,
        workspaceId: workspaceId,
      },
      {
        userId: DemoSeedUserIds.Hugo,
        workspaceId: workspaceId,
      },
      {
        userId: DemoSeedUserIds.Julia,
        workspaceId: workspaceId,
      },
    ])
    .execute();
};

export const deleteUserWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, {
      workspaceId,
    })
    .execute();
};
