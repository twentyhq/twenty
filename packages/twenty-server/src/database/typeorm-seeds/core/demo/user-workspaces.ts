import { DataSource } from 'typeorm';

import { DEMO_SEED_USER_IDS } from 'src/database/typeorm-seeds/core/demo/users';

const tableName = 'userWorkspace';

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
        userId: DEMO_SEED_USER_IDS.NOAH,
        workspaceId: workspaceId,
      },
      {
        userId: DEMO_SEED_USER_IDS.HUGO,
        workspaceId: workspaceId,
      },
      {
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
