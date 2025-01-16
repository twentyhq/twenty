import { WorkspaceActivationStatus } from 'twenty-shared';
import { DataSource } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

const tableName = 'workspace';

export const SEED_APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SEED_ACME_WORKSPACE_ID = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';

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
      | 'subdomain'
      | 'activationStatus'
    >;
  } = {
    [SEED_APPLE_WORKSPACE_ID]: {
      id: workspaceId,
      displayName: 'Apple',
      domainName: 'apple.dev',
      subdomain: 'apple',
      inviteHash: 'apple.dev-invite-hash',
      logo: 'https://twentyhq.github.io/placeholder-images/workspaces/apple-logo.png',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    },
    [SEED_ACME_WORKSPACE_ID]: {
      id: workspaceId,
      displayName: 'Acme',
      domainName: 'acme.dev',
      subdomain: 'acme',
      inviteHash: 'acme.dev-invite-hash',
      logo: 'https://logos-world.net/wp-content/uploads/2022/05/Acme-Logo-700x394.png',
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
      'subdomain',
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
