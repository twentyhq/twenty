import { type RecordPermissionAuthorityIdentity } from 'src/engine/core-modules/record-permission/types/record-permission-authority-identity.type';
import { loadCurrentRecordPermissionMetadata } from 'src/engine/core-modules/record-permission/utils/load-current-record-permission-metadata.util';
import { resolveCurrentRecordPermissionRoleIds } from 'src/engine/core-modules/record-permission/utils/resolve-current-record-permission-role-ids.util';
import { resolveRecordPermissionDefinition } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-definition.util';
import { getRecordCapabilities } from 'src/engine/core-modules/record-permission/utils/get-record-capabilities.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { type DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  type RecordPermissionAuthority,
  type RecordPermissionMetadata,
  type RecordPermissionContext,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { RecordPermissionRevisionEntity } from 'src/engine/metadata-modules/record-permissions/entities/record-permission-revision.entity';
import { type ORMWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

export const loadActiveRecordPermissionContext = async ({
  dataSource,
  workspaceContext,
}: {
  dataSource: DataSource;
  workspaceContext: ORMWorkspaceContext;
}): Promise<RecordPermissionContext | undefined> => {
  const permissionConfig = resolveRolePermissionConfig(workspaceContext);

  return loadRecordPermissionContextForAuthorities({
    dataSource,
    workspaceId: workspaceContext.authContext.workspace.id,
    authContext: workspaceContext.authContext,
    roleIds: isDefined(permissionConfig)
      ? getRoleIdsFromRolePermissionConfig(permissionConfig)
      : [],
    workspaceMember:
      workspaceContext.authContext.type === 'user'
        ? workspaceContext.authContext.workspaceMember
        : undefined,
    metadata: workspaceContext,
  });
};

export const loadRecordPermissionContextForAuthorities = async ({
  dataSource,
  workspaceId,
  roleIds,
  authContext,
  workspaceMember,
  metadata,
}: {
  dataSource: DataSource;
  workspaceId: string;
  roleIds: string[];
  authContext?: RecordPermissionAuthorityIdentity;
  workspaceMember?: RecordPermissionAuthority['workspaceMember'];
  metadata: RecordPermissionMetadata;
}): Promise<RecordPermissionContext | undefined> => {
  const revision = await dataSource
    .getRepository(RecordPermissionRevisionEntity)
    .findOneBy({ workspaceId, status: 'active' });

  if (!isDefined(revision)) {
    return undefined;
  }

  const currentMetadata = await loadCurrentRecordPermissionMetadata({
    dataSource,
    workspaceId,
    metadata,
  });

  const currentRoleIds = isDefined(authContext)
    ? await resolveCurrentRecordPermissionRoleIds({ dataSource, authContext })
    : roleIds;
  const requiredRoleIds = currentRoleIds ?? [];

  const allRoles: { id: string; universalIdentifier: string }[] =
    await dataSource.query(
      'SELECT id, "universalIdentifier" FROM core.role WHERE "workspaceId" = $1',
      [revision.workspaceId],
    );
  const roles = allRoles.filter((role) => requiredRoleIds.includes(role.id));

  if (roles.length !== requiredRoleIds.length) {
    throw new Error('Record permission authority is no longer valid');
  }

  let currentWorkspaceMember = workspaceMember;

  if (isDefined(workspaceMember)) {
    const memberObject = Object.values(
      metadata.flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((object) => object?.nameSingular === 'workspaceMember');

    if (!isDefined(memberObject))
      throw new Error('Workspace member metadata is unavailable');
    const [record] = await dataSource.query(
      `SELECT * FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(memberObject))} WHERE id = $1 AND "deletedAt" IS NULL`,
      [workspaceMember.id],
    );

    if (!isDefined(record))
      throw new Error('Workspace member is no longer active');
    currentWorkspaceMember = formatResult<
      NonNullable<RecordPermissionAuthority['workspaceMember']>
    >(
      record,
      memberObject,
      metadata.flatObjectMetadataMaps,
      metadata.flatFieldMetadataMaps,
    );
  }

  return {
    denyAll: currentRoleIds === null,
    roleUniversalIdentifiersById: Object.fromEntries(
      allRoles.map((role) => [role.id, role.universalIdentifier]),
    ),
    revisionId: revision.id,
    definition: resolveRecordPermissionDefinition(
      revision.definition,
      currentMetadata,
    ),
    schemaName: getWorkspaceSchemaName(revision.workspaceId),
    flatObjectMetadataMaps: currentMetadata.flatObjectMetadataMaps,
    flatFieldMetadataMaps: currentMetadata.flatFieldMetadataMaps,
    authorities: roles.map((role) => ({
      roleId: role.id,
      roleUniversalIdentifier: role.universalIdentifier,
      workspaceMember: currentWorkspaceMember,
    })),
    capabilitiesByObjectUniversalIdentifier: Object.fromEntries(
      Object.values(
        currentMetadata.flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .map((object) => [
          object.universalIdentifier,
          getRecordCapabilities(object),
        ]),
    ),
  };
};
