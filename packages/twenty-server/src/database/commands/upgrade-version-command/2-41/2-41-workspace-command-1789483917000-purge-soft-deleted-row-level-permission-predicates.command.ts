import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.41.0', 1789483917000)
@Command({
  name: 'upgrade:2-41:purge-soft-deleted-row-level-permission-predicates',
  description:
    'Hard-delete soft-deleted row-level permission predicates and groups, along with the rows nested under a soft-deleted group',
})
export class PurgeSoftDeletedRowLevelPermissionPredicatesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);

    const flatGroups = Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const flatPredicates = Object.values(
      flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const groupIdsToDelete = new Set(
      flatGroups
        .filter((group) => isDefined(group.deletedAt))
        .map((group) => group.id),
    );

    let hasFoundNestedGroup = true;

    while (hasFoundNestedGroup) {
      hasFoundNestedGroup = false;

      for (const group of flatGroups) {
        if (
          !groupIdsToDelete.has(group.id) &&
          isDefined(group.parentRowLevelPermissionPredicateGroupId) &&
          groupIdsToDelete.has(group.parentRowLevelPermissionPredicateGroupId)
        ) {
          groupIdsToDelete.add(group.id);
          hasFoundNestedGroup = true;
        }
      }
    }

    const groupsToDelete = flatGroups.filter((group) =>
      groupIdsToDelete.has(group.id),
    );
    const predicatesToDelete = flatPredicates.filter(
      (predicate) =>
        isDefined(predicate.deletedAt) ||
        (isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
          groupIdsToDelete.has(predicate.rowLevelPermissionPredicateGroupId)),
    );

    if (groupsToDelete.length === 0 && predicatesToDelete.length === 0) {
      this.logger.log(
        `No soft-deleted row-level permission predicate or group for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Purging ${predicatesToDelete.length} row-level permission predicate(s) and ${groupsToDelete.length} group(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            rowLevelPermissionPredicateGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: groupsToDelete,
              flatEntityToUpdate: [],
            },
            rowLevelPermissionPredicate: {
              flatEntityToCreate: [],
              flatEntityToDelete: predicatesToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to purge soft-deleted row-level permission predicates for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);

    this.logger.log(
      `Purged ${predicatesToDelete.length} row-level permission predicate(s) and ${groupsToDelete.length} group(s) for workspace ${workspaceId}`,
    );
  }
}
