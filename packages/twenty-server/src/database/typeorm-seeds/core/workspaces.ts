import { WorkspaceActivationStatus } from 'twenty-shared';
import { DataSource } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

const tableName = 'workspace';

export const SEED_APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SEED_ACME_WORKSPACE_ID = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';

export type SeedWorkspaceArgs = {
  workspaceDataSource: DataSource;
  schemaName: string;
  workspaceId: string;
  appVersion: string | undefined;
};

const workspaceSeederFields = [
  'id',
  'displayName',
  'subdomain',
  'inviteHash',
  'logo',
  'activationStatus',
  'version',
] as const satisfies (keyof Workspace)[];

type WorkspaceSeederFields = Pick<
  Workspace,
  (typeof workspaceSeederFields)[number]
>;

export const seedWorkspaces = async ({
  schemaName,
  workspaceDataSource,
  workspaceId,
  appVersion,
}: SeedWorkspaceArgs) => {
  const version = extractVersionMajorMinorPatch(appVersion);

  const workspaces: Record<string, WorkspaceSeederFields> = {
    [SEED_APPLE_WORKSPACE_ID]: {
      id: SEED_APPLE_WORKSPACE_ID,
      displayName: 'Apple',
      subdomain: 'apple',
      inviteHash: 'apple.dev-invite-hash',
      logo: 'https://twentyhq.github.io/placeholder-images/workspaces/apple-logo.png',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      version: version,
    },
    [SEED_ACME_WORKSPACE_ID]: {
      id: SEED_ACME_WORKSPACE_ID,
      displayName: 'Acme',
      subdomain: 'acme',
      inviteHash: 'acme.dev-invite-hash',
      logo: 'https://logos-world.net/wp-content/uploads/2022/05/Acme-Logo-700x394.png',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      version: version,
    },
  };

  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, workspaceSeederFields)
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
