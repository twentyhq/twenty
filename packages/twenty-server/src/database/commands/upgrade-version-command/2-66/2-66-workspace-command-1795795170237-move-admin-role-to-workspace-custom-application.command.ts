import { Command } from 'nest-commander';

import { InjectDataSource } from '@nestjs/typeorm';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';
import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ADMIN_ROLE_TABLES = [
  { metadataName: 'role', tableName: 'role', roleIdColumnName: 'id' },
  {
    metadataName: 'objectPermission',
    tableName: 'objectPermission',
    roleIdColumnName: 'roleId',
  },
  {
    metadataName: 'fieldPermission',
    tableName: 'fieldPermission',
    roleIdColumnName: 'roleId',
  },
  {
    metadataName: 'rolePermissionFlag',
    tableName: 'rolePermissionFlag',
    roleIdColumnName: 'roleId',
  },
  {
    metadataName: 'rowLevelPermissionRule',
    tableName: 'rowLevelPermissionRule',
    roleIdColumnName: 'roleId',
  },
  {
    metadataName: 'rowLevelPermissionPredicateGroup',
    tableName: 'rowLevelPermissionPredicateGroup',
    roleIdColumnName: 'roleId',
  },
  {
    metadataName: 'rowLevelPermissionPredicate',
    tableName: 'rowLevelPermissionPredicate',
    roleIdColumnName: 'roleId',
  },
  {
    metadataName: 'agentChatChannelRole',
    tableName: 'inboxChannelRole',
    roleIdColumnName: 'roleId',
  },
] as const;

@RegisteredWorkspaceCommand('2.66.0', 1795795170237)
@Command({
  name: 'upgrade:2-66:move-admin-role-to-workspace-custom-application',
  description:
    'Give the Admin role, and every permission twenty-standard owns on it, to the workspace custom application',
})
export class MoveAdminRoleToWorkspaceCustomApplicationCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    const adminFlatRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(adminFlatRole)) {
      this.logger.warn(`No Admin role found for workspace ${workspaceId}`);

      return;
    }

    const parameters = [
      workspaceId,
      adminFlatRole.id,
      twentyStandardFlatApplication.id,
    ];

    const rowCounts = await this.coreDataSource.transaction(
      async (entityManager) => {
        const rowCountsByTable: number[] = [];

        for (const { tableName, roleIdColumnName } of ADMIN_ROLE_TABLES) {
          const whereClause = `"workspaceId" = $1 AND "${roleIdColumnName}" = $2 AND "applicationId" = $3`;

          if (isDryRun) {
            const [{ rowCount }]: { rowCount: number }[] =
              await entityManager.query(
                `SELECT count(*)::int AS "rowCount" FROM core."${tableName}" WHERE ${whereClause}`,
                parameters,
              );

            rowCountsByTable.push(rowCount);

            continue;
          }

          const [, rowCount]: [{ id: string }[], number] =
            await entityManager.query(
              `UPDATE core."${tableName}" SET "applicationId" = $4 WHERE ${whereClause} RETURNING "id"`,
              [...parameters, workspaceCustomFlatApplication.id],
            );

          rowCountsByTable.push(rowCount);
        }

        return rowCountsByTable;
      },
    );

    const movedRowCount = rowCounts.reduce(
      (total, rowCount) => total + rowCount,
      0,
    );

    if (movedRowCount === 0) {
      this.logger.log(
        `Admin role already owned by the custom application for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Moving ${movedRowCount} Admin role row(s) to the custom application for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.workspaceCacheService.flush(
      workspaceId,
      ADMIN_ROLE_TABLES.map(({ metadataName }) =>
        getMetadataFlatEntityMapsKey(metadataName),
      ),
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }
}
