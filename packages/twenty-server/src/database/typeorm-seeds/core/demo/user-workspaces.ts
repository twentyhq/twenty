import { DataSource } from 'typeorm';

import { DEMO_SEED_USER_IDS } from 'src/database/typeorm-seeds/core/demo/users';

const tableName = 'userWorkspace';

export const DEV_SEED_USER_WORKSPACE_IDS = {
  NOAH: '20202020-9e3b-46d4-a556-88b9ddc2b534',
  HUGO: '20202020-3957-4908-9c36-2929a23f8457',
  TIM: '20202020-9e3b-46d4-a556-88b9ddc2b015',
};

export const seedUserWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'userId', 'workspaceId'])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.NOAH,
        userId: DEMO_SEED_USER_IDS.NOAH,
        workspaceId: workspaceId,
      },
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.HUGO,
        userId: DEMO_SEED_USER_IDS.HUGO,
        workspaceId: workspaceId,
      },
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.TIM,
        userId: DEMO_SEED_USER_IDS.TIM,
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
