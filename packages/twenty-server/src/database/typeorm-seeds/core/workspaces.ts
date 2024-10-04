import { DataSource } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';

const tableName = 'workspace';

export const SEED_APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SEED_TWENTY_WORKSPACE_ID = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';

export const seedWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  const workspaces: {
    [key: string]: Pick<
      Workspace,
      | 'id'
      | 'displayName'
      | 'domainName'
      | 'inviteHash'
      | 'logo'
      | 'activationStatus'
    >;
  } = {
    [SEED_APPLE_WORKSPACE_ID]: {
      id: workspaceId,
      displayName: 'Apple',
      domainName: 'apple.dev',
      inviteHash: 'apple.dev-invite-hash',
      logo: 'https://twentyhq.github.io/placeholder-images/workspaces/apple-logo.png',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    },
    [SEED_TWENTY_WORKSPACE_ID]: {
      id: workspaceId,
      displayName: 'Twenty',
      domainName: 'twenty.dev',
      inviteHash: 'twenty.dev-invite-hash',
      logo: 'https://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    },
  };

  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'displayName',
      'domainName',
      'inviteHash',
      'logo',
      'activationStatus',
    ])
    .orIgnore()
    .values(workspaces[workspaceId])
    .execute();
};

export const deleteWorkspaces = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`${tableName}."id" = :id`, { id: workspaceId })
    .execute();
};
