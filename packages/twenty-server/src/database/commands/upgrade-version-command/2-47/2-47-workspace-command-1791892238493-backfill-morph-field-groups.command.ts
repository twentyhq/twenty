import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMorphFieldGroups } from 'src/database/commands/upgrade-version-command/2-47/utils/build-morph-field-groups.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.47.0', 1791892238493)
@Command({
  name: 'upgrade:2-47:backfill-morph-field-groups',
  description:
    'Create the group field of every morph relation field, without moving references to it',
})
export class BackfillMorphFieldGroupsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        now: new Date().toISOString(),
      });

    const { groupsToCreate, skippedGroups } = buildMorphFieldGroups({
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps:
        standardAllFlatEntityMaps.flatFieldMetadataMaps,
    });

    for (const { morphId, reason } of skippedGroups) {
      this.logger.warn(
        `Skipping morph field group ${morphId} in workspace ${workspaceId}: ${reason}`,
      );
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Creating ${groupsToCreate.length} morph field groups in workspace ${workspaceId}`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runFieldOperations({
      workspaceId,
      flatFieldMetadatasToCreate: groupsToCreate,
      flatFieldMetadatasToDelete: [],
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const groupsToDelete = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isMorphRelationGroup);

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Deleting ${groupsToDelete.length} morph field groups in workspace ${workspaceId}`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runFieldOperations({
      workspaceId,
      flatFieldMetadatasToCreate: [],
      flatFieldMetadatasToDelete: groupsToDelete,
    });
  }

  private async runFieldOperations({
    workspaceId,
    flatFieldMetadatasToCreate,
    flatFieldMetadatasToDelete,
  }: {
    workspaceId: string;
    flatFieldMetadatasToCreate: FlatFieldMetadata[];
    flatFieldMetadatasToDelete: FlatFieldMetadata[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = new Set(
      [...flatFieldMetadatasToCreate, ...flatFieldMetadatasToDelete].map(
        (flatFieldMetadata) => flatFieldMetadata.applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const belongsToApplication = (flatFieldMetadata: FlatFieldMetadata) =>
        flatFieldMetadata.applicationUniversalIdentifier ===
        applicationUniversalIdentifier;

      const args = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate:
              flatFieldMetadatasToCreate.filter(belongsToApplication),
            flatEntityToUpdate: [],
            flatEntityToDelete:
              flatFieldMetadatasToDelete.filter(belongsToApplication),
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              args,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              args,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          'Failed to backfill morph field groups',
        );
      }
    }
  }
}
