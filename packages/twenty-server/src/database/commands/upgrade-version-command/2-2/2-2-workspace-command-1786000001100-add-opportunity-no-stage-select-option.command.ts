import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const OPPORTUNITY_NO_STAGE_OPTION_ID =
  '20202020-f3c2-4b8a-9d01-050005050050';

const NO_STAGE_OPTION_LABEL = 'No stage';

const NO_STAGE_OPTION_POSITION = 5;

@RegisteredWorkspaceCommand('2.2.0', 1786000001100)
@Command({
  name: 'upgrade:2-2:add-opportunity-no-stage-select-option',
  description:
    'Add NO_STAGE value to opportunity.stage select options for workspaces missing it',
})
export class AddOpportunityNoStageSelectOptionCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const stageField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
    });

    if (!stageField?.options?.length) {
      this.logger.log(
        `opportunity.stage field without options not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (
      stageField.options.some((option: { value: string }) => option.value === 'NO_STAGE')
    ) {
      this.logger.log(
        `NO_STAGE opportunity.stage option already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add NO_STAGE opportunity.stage select option for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...stageField,
                  options: [
                    ...stageField.options,
                    {
                      id: OPPORTUNITY_NO_STAGE_OPTION_ID,
                      color: 'gray',
                      label: NO_STAGE_OPTION_LABEL,
                      position: NO_STAGE_OPTION_POSITION,
                      value: 'NO_STAGE',
                    },
                  ],
                },
              ],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to add NO_STAGE opportunity.stage select option for workspace ${workspaceId}: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
    }

    this.logger.log(
      `Added NO_STAGE opportunity.stage select option for workspace ${workspaceId}`,
    );
  }
}
