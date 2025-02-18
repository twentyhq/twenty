import { DataSource } from 'typeorm';

import { DEV_SEED_USER_IDS } from 'src/database/typeorm-seeds/core/users';
import {
  SEED_ACME_WORKSPACE_ID,
  SEED_APPLE_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

const tableName = 'userWorkspace';

export const DEV_SEED_USER_WORKSPACE_IDS = {
  TIM: '20202020-9e3b-46d4-a556-88b9ddc2b035',
  JONY: '20202020-3957-4908-9c36-2929a23f8353',
  PHIL: '20202020-7169-42cf-bc47-1cfef15264b1',
  TIM_ACME: '20202020-e10a-4c27-a90b-b08c57b02d44',
};

export const seedUserWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  let userWorkspaces: Pick<UserWorkspace, 'id' | 'userId' | 'workspaceId'>[] =
    [];

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    userWorkspaces = [
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.TIM,
        userId: DEV_SEED_USER_IDS.TIM,
        workspaceId,
      },
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.JONY,
        userId: DEV_SEED_USER_IDS.JONY,
        workspaceId,
      },
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.PHIL,
        userId: DEV_SEED_USER_IDS.PHIL,
        workspaceId,
      },
    ];
  }

  if (workspaceId === SEED_ACME_WORKSPACE_ID) {
    userWorkspaces = [
      {
        id: DEV_SEED_USER_WORKSPACE_IDS.TIM_ACME,
        userId: DEV_SEED_USER_IDS.TIM,
        workspaceId,
      },
    ];
  }
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'userId', 'workspaceId'])
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
