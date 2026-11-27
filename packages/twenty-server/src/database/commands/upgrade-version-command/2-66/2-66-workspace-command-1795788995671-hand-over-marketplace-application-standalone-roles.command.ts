import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findMarketplaceFlatApplications } from 'src/database/commands/upgrade-version-command/2-66/utils/find-marketplace-flat-applications.util';
import {
  planStandaloneRoleHandover,
  type StandaloneRoleHandover,
} from 'src/database/commands/upgrade-version-command/2-66/utils/plan-standalone-role-handover.util';
import { selectMarketplaceApplicationRoles } from 'src/database/commands/upgrade-version-command/2-66/utils/select-marketplace-application-roles.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ROLE_RELATED_FLAT_ENTITY_MAPS_KEYS = (
  [
    'role',
    'roleTarget',
    'objectPermission',
    'fieldPermission',
    'rolePermissionFlag',
    'rowLevelPermissionRule',
    'rowLevelPermissionPredicate',
    'rowLevelPermissionPredicateGroup',
    'agentChatChannelRole',
  ] as const
).map(getMetadataFlatEntityMapsKey);

@RegisteredWorkspaceCommand('2.66.0', 1795788995671)
@Command({
  name: 'upgrade:2-66:hand-over-marketplace-application-standalone-roles',
  description:
    'Give the workspace custom app the roles a marketplace app declares that are neither its requested role nor used by its agents, keeping their id, holders, rules and field permissions',
})
export class HandOverMarketplaceApplicationStandaloneRolesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
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

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatApplicationMaps,
      flatRoleMaps,
      flatRoleTargetMaps,
      flatAgentMaps,
      ...flatEntityMaps
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatApplicationMaps',
      'flatRoleMaps',
      'flatRoleTargetMaps',
      'flatAgentMaps',
      'flatObjectPermissionMaps',
      'flatFieldPermissionMaps',
      'flatRolePermissionFlagMaps',
      'flatRowLevelPermissionRuleMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatRowLevelPermissionPredicateMaps',
    ]);

    const handovers: StandaloneRoleHandover[] = [];

    for (const flatApplication of findMarketplaceFlatApplications({
      flatApplicationMaps,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    })) {
      const { standaloneFlatRoles } = selectMarketplaceApplicationRoles({
        flatApplication,
        flatRoleMaps,
        flatRoleTargetMaps,
        flatAgentMaps,
      });

      if (standaloneFlatRoles.length === 0) {
        continue;
      }

      const applicationHandovers = standaloneFlatRoles.map((flatRole) =>
        planStandaloneRoleHandover({
          flatRole,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          flatEntityMaps,
        }),
      );

      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}, application ${flatApplication.universalIdentifier}: ${applicationHandovers.length} standalone role(s) handed over to the workspace custom application (${applicationHandovers.map(({ flatRole }) => `"${flatRole.label}"`).join(', ')}), ${applicationHandovers.reduce((count, { rows }) => count + rows.length, 0)} row(s) rewritten`,
      );

      handovers.push(...applicationHandovers);
    }

    if (isDryRun || handovers.length === 0) {
      return;
    }

    await this.coreDataSource.transaction(async (entityManager) => {
      for (const { rows } of handovers) {
        for (const { tableName, id, universalIdentifier } of rows) {
          await entityManager.query(
            `UPDATE core."${tableName}" SET "applicationId" = $1, "universalIdentifier" = $2 WHERE id = $3 AND "workspaceId" = $4`,
            [
              workspaceCustomFlatApplication.id,
              universalIdentifier,
              id,
              workspaceId,
            ],
          );
        }
      }
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      ...ROLE_RELATED_FLAT_ENTITY_MAPS_KEYS,
      'rolesPermissions',
    ]);
  }
}
