import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource } from 'typeorm';

const tableName = 'workspace';

export const seedWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'displayName',
      'domainName',
      'inviteHash',
      'logo',
      'subdomain',
      'activationStatus',
    ])
    .orIgnore()
    .values([
      {
        id: workspaceId,
        displayName: 'Demo',
        domainName: 'demo.dev',
        inviteHash: 'demo.dev-invite-hash',
        logo: 'https://twentyhq.github.io/placeholder-images/workspaces/apple-logo.png',
        subdomain: 'demo',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    ])
    .execute();
};

export const deleteWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`${tableName}."id" = :id`, { id: workspaceId })
    .execute();
};
