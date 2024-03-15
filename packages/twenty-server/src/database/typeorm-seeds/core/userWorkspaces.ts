import { DataSource } from 'typeorm';

import {
  SeedAppleWorkspaceId,
  SeedTwentyWorkspaceId,
} from 'src/database/typeorm-seeds/core/workspaces';
import { UserWorkspace } from 'src/engine/modules/user-workspace/user-workspace.entity';

// import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'userWorkspace';

export enum SeedUserIds {
  Tim = '20202020-9e3b-46d4-a556-88b9ddc2b034',
  Jony = '20202020-3957-4908-9c36-2929a23f8357',
  Phil = '20202020-7169-42cf-bc47-1cfef15264b8',
}

export const seedUserWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  let userWorkspaces: Pick<UserWorkspace, 'userId' | 'workspaceId'>[] = [];

  if (workspaceId === SeedAppleWorkspaceId) {
    userWorkspaces = [
      {
        userId: SeedUserIds.Tim,
        workspaceId,
      },
      {
        userId: SeedUserIds.Jony,
        workspaceId,
      },
      {
        userId: SeedUserIds.Phil,
        workspaceId,
      },
    ];
  }

  if (workspaceId === SeedTwentyWorkspaceId) {
    userWorkspaces = [
      {
        userId: SeedUserIds.Tim,
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
