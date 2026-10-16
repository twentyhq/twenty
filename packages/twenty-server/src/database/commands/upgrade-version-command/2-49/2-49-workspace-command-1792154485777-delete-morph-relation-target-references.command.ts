import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findMorphRelationTargetReferences } from 'src/database/commands/upgrade-version-command/2-49/utils/find-morph-relation-target-references.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.49.0', 1792154485777)
@Command({
  name: 'upgrade:2-49:delete-morph-relation-target-references',
  description:
    'Delete the view fields and filters of morph relation targets, and the field permissions the 2.48 copy duplicated onto their head',
})
export class DeleteMorphRelationTargetReferencesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatFieldPermissionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
      'flatFieldPermissionMaps',
    ]);

    const { viewFields, viewFilters, fieldPermissions } =
      findMorphRelationTargetReferences({
        flatFieldMetadataMaps,
        flatViewFieldMaps,
        flatViewFilterMaps,
        flatFieldPermissionMaps,
      });

    if (
      viewFields.length + viewFilters.length + fieldPermissions.length ===
      0
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would delete ${viewFields.length} view field(s), ${viewFilters.length} view filter(s) and ${fieldPermissions.length} field permission(s) on morph relation targets`,
      );

      return;
    }

    const applicationUniversalIdentifiers = new Set(
      [...viewFields, ...viewFilters, ...fieldPermissions].map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const ownedBy = <
        TEntity extends { applicationUniversalIdentifier: string },
      >(
        entities: TEntity[],
      ) => ({
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: entities.filter(
          (entity) =>
            entity.applicationUniversalIdentifier ===
            applicationUniversalIdentifier,
        ),
      });

      const args = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: ownedBy(viewFields),
          viewFilter: ownedBy(viewFilters),
          fieldPermission: ownedBy(fieldPermissions),
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              args,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              args,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to delete morph relation target references of application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {}
}
