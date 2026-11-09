import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  APPLICATION_GRANT_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
  buildApplicationGrantRoleFromToFlatEntityMaps,
} from 'src/engine/core-modules/application/application-grant-role/utils/build-application-grant-role-from-to-flat-entity-maps.util';
import { findApplicationGrantRoleFlatRoleTarget } from 'src/engine/core-modules/application/application-grant-role/utils/find-application-grant-role-flat-role-target.util';
import { canApplicationHaveGrantRole } from 'src/engine/core-modules/application/application-grant-role/utils/can-application-have-grant-role.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.57.0', 1794155089946)
@Command({
  name: 'upgrade:2-57:backfill-application-grant-roles',
  description:
    'Give twenty-standard and every installed application without a grant a copy of its requested role',
})
export class BackfillApplicationGrantRolesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatApplicationMaps, flatRoleTargetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatRoleTargetMaps',
      ]);

    const flatApplicationsWithoutGrantRole = Object.values(flatApplicationMaps.byId)
      .filter(isDefined)
      .filter(
        (flatApplication) =>
          !isDefined(flatApplication.deletedAt) &&
          canApplicationHaveGrantRole({
            flatApplication,
            workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
          }) &&
          !isDefined(
            findApplicationGrantRoleFlatRoleTarget({
              flatRoleTargetMaps,
              applicationUniversalIdentifier:
                flatApplication.universalIdentifier,
            }),
          ),
      );

    const failedApplicationUniversalIdentifiers: string[] = [];

    for (const flatApplication of flatApplicationsWithoutGrantRole) {
      // Reloaded for each application so grant labels stay unique across the batch
      const {
        featureFlagsMap,
        billingEntitlements,
        flatRoleMaps,
        flatObjectPermissionMaps,
        flatFieldPermissionMaps,
        flatRolePermissionFlagMaps,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        ...otherDependencyFlatEntityMaps
      } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...APPLICATION_GRANT_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
        'flatRoleMaps',
        'flatObjectPermissionMaps',
        'flatFieldPermissionMaps',
        'flatRolePermissionFlagMaps',
        'flatRowLevelPermissionPredicateMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
        'featureFlagsMap',
        'billingEntitlements',
      ]);

      const flatEntityMaps = {
        flatRoleMaps,
        flatObjectPermissionMaps,
        flatFieldPermissionMaps,
        flatRolePermissionFlagMaps,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
      };

      const requestedFlatRole = isDefined(flatApplication.defaultRoleId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: flatApplication.defaultRoleId,
            flatEntityMaps: flatRoleMaps,
          })
        : undefined;

      if (!isDefined(requestedFlatRole)) {
        this.logger.warn(
          `Workspace ${workspaceId}: application ${flatApplication.universalIdentifier} has no default role, skipping its grant`,
        );
        continue;
      }

      this.logger.log(
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: granting application ${flatApplication.universalIdentifier} a copy of role ${requestedFlatRole.universalIdentifier}`,
      );

      if (options.dryRun) {
        continue;
      }

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
          {
            workspaceId,
            buildOptions: {
              isSystemBuild: true,
              inferDeletionFromMissingEntities: true,
              applicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
            },
            fromToAllFlatEntityMaps: buildApplicationGrantRoleFromToFlatEntityMaps({
              targetFlatApplication: flatApplication,
              requestedFlatRole,
              existingGrantRole: undefined,
              workspaceCustomApplicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              flatEntityMaps,
              now: new Date().toISOString(),
            }),
            dependencyAllFlatEntityMaps: structuredClone({
              ...otherDependencyFlatEntityMaps,
              ...flatEntityMaps,
            }),
            additionalCacheDataMaps: { featureFlagsMap, billingEntitlements },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Workspace ${workspaceId}: could not grant application ${flatApplication.universalIdentifier}: ${JSON.stringify(result.report)}`,
        );
        failedApplicationUniversalIdentifiers.push(
          flatApplication.universalIdentifier,
        );
      }
    }

    if (failedApplicationUniversalIdentifiers.length > 0) {
      throw new Error(
        `Workspace ${workspaceId}: could not grant applications ${failedApplicationUniversalIdentifiers.join(', ')}`,
      );
    }
  }
}
