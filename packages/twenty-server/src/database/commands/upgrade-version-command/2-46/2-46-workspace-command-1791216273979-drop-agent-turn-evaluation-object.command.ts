import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Kept as literals because the standard definitions no longer include them.
const AGENT_TURN_EVALUATION_OBJECT_UNIVERSAL_IDENTIFIER =
  '73741409-7835-426f-8425-9de13af22302';
const AGENT_TURN_EVALUATIONS_FIELD_UNIVERSAL_IDENTIFIER =
  '282b4815-9c5e-4897-8f9a-a4587af6b0e2';

@RegisteredWorkspaceCommand('2.46.0', 1791216273979)
@Command({
  name: 'upgrade:2-46:drop-agent-turn-evaluation-object',
  description:
    'Drop the agentTurnEvaluation standard object now that agent evaluations are removed',
})
export class DropAgentTurnEvaluationObjectCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const evaluationObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: AGENT_TURN_EVALUATION_OBJECT_UNIVERSAL_IDENTIFIER,
      });
    const evaluationsField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: AGENT_TURN_EVALUATIONS_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(evaluationObject) && !isDefined(evaluationsField)) {
      this.logger.log(
        `agentTurnEvaluation object already absent for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would delete the agentTurnEvaluation object and the agentTurn evaluations field for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            ...(isDefined(evaluationObject)
              ? {
                  objectMetadata: {
                    flatEntityToCreate: [],
                    flatEntityToDelete: [evaluationObject],
                    flatEntityToUpdate: [],
                  },
                }
              : {}),
            ...(isDefined(evaluationsField)
              ? {
                  fieldMetadata: {
                    flatEntityToCreate: [],
                    flatEntityToDelete: [evaluationsField],
                    flatEntityToUpdate: [],
                  },
                }
              : {}),
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to delete the agentTurnEvaluation object:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to delete the agentTurnEvaluation object for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Deleted the agentTurnEvaluation object for workspace ${workspaceId}`,
    );
  }
}
