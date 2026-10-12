import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Role settings refuse field permissions on system objects, so a workspace
// custom application row on one can only be a mirror of a relation field
// restriction, such as client "Tasks" mirrored onto taskTarget.targetClient.
// Those rows are hidden from role settings and block linking tasks, notes and
// attachments to the record. Deleted rows are not restored on down: they were
// never meant to exist.
@RegisteredWorkspaceCommand('2.47.0', 1791807688671)
@Command({
  name: 'upgrade:2-47:delete-field-permissions-mirrored-onto-system-objects',
  description:
    'Delete field permissions mirrored onto system objects from relation field restrictions',
})
export class DeleteFieldPermissionsMirroredOntoSystemObjectsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps, flatFieldPermissionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldPermissionMaps',
      ]);

    const fieldPermissionsToDelete = Object.values(
      flatFieldPermissionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldPermission) =>
          flatFieldPermission.applicationId ===
            workspaceCustomFlatApplication.id &&
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: flatFieldPermission.objectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })?.isSystem === true,
      );

    if (fieldPermissionsToDelete.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Deleting ${fieldPermissionsToDelete.length} field permission(s) mirrored onto system objects in workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldPermission: {
              flatEntityToCreate: [],
              flatEntityToDelete: fieldPermissionsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to delete field permissions mirrored onto system objects in workspace ${workspaceId}`,
      );
    }
  }
}
