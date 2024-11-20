import { DataSource } from 'typeorm';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_ACME_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { DEV_SEED_USER_IDS } from 'src/database/typeorm-seeds/core/users';

const tableName = 'userWorkspace';

export const seedUserWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  let userWorkspaces: Pick<UserWorkspace, 'userId' | 'workspaceId'>[] = [];

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    userWorkspaces = [
      {
        userId: DEV_SEED_USER_IDS.TIM,
        workspaceId,
      },
      {
        userId: DEV_SEED_USER_IDS.JONY,
        workspaceId,
      },
      {
        userId: DEV_SEED_USER_IDS.PHIL,
        workspaceId,
      },
    ];
  }

  if (workspaceId === SEED_ACME_WORKSPACE_ID) {
    userWorkspaces = [
      {
        userId: DEV_SEED_USER_IDS.TIM,
        workspaceId,
      },
    ];
  }
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['userId', 'workspaceId'])
    .orIgnore()
    .values(userWorkspaces)
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
