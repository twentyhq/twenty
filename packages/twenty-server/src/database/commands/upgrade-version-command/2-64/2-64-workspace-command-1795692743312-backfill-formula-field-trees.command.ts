import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildFormulaFieldTreeBackfill } from 'src/database/commands/upgrade-version-command/2-64/utils/build-formula-field-tree-backfill.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.64.0', 1795692743312)
@Command({
  name: 'upgrade:2-64:backfill-formula-field-trees',
  description:
    'Store a tree reading fields by identifier next to the text of each formula field',
})
export class BackfillFormulaFieldTreesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const { flatFieldMetadatasToUpdate, unparsedFormulaFieldNames } =
      buildFormulaFieldTreeBackfill({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (isNonEmptyArray(unparsedFormulaFieldNames)) {
      this.logger.warn(
        `Workspace ${workspaceId}: formula field(s) ${unparsedFormulaFieldNames.join(', ')} do not parse and get no tree`,
      );
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: storing ${flatFieldMetadatasToUpdate.length} formula field(s) as trees`,
    );

    if (options.dryRun || !isNonEmptyArray(flatFieldMetadatasToUpdate)) {
      return;
    }

    await this.updateFlatFieldMetadatasOrThrow({
      workspaceId,
      flatFieldMetadatasToUpdate,
    });
  }

  private async updateFlatFieldMetadatasOrThrow({
    workspaceId,
    flatFieldMetadatasToUpdate,
  }: {
    workspaceId: string;
    flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = [
      ...new Set(
        flatFieldMetadatasToUpdate.map(
          ({ applicationUniversalIdentifier }) =>
            applicationUniversalIdentifier,
        ),
      ),
    ];

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const migrationArgs = {
        shouldDeferActions: false,
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: flatFieldMetadatasToUpdate.filter(
              (flatFieldMetadata) =>
                flatFieldMetadata.applicationUniversalIdentifier ===
                applicationUniversalIdentifier,
            ),
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
