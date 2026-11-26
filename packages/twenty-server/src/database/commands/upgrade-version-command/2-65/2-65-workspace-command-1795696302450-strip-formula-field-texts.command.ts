import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildFormulaFieldTextStrips } from 'src/database/commands/upgrade-version-command/2-65/utils/build-formula-field-text-strips.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.65.0', 1795696302450)
@Command({
  name: 'upgrade:2-65:strip-formula-field-texts',
  description:
    'Drop the text and bindings that formula fields kept next to their tree in 2.64',
})
export class StripFormulaFieldTextsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const { flatFieldMetadatasToUpdate, treelessFormulaFieldNames } =
      buildFormulaFieldTextStrips({
        flatFieldMetadataMaps,
      });

    if (isNonEmptyArray(treelessFormulaFieldNames)) {
      this.logger.warn(
        `Workspace ${workspaceId}: formula field(s) ${treelessFormulaFieldNames.join(', ')} have no tree and keep their text`,
      );
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: dropping the text of ${flatFieldMetadatasToUpdate.length} formula field(s)`,
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
