import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const AGENT_TURN_FIELDS = STANDARD_OBJECTS.agentTurn.fields;

const RUN_FIELD_UNIVERSAL_IDENTIFIERS = [
  AGENT_TURN_FIELDS.status.universalIdentifier,
  AGENT_TURN_FIELDS.error.universalIdentifier,
  AGENT_TURN_FIELDS.startedAt.universalIdentifier,
  AGENT_TURN_FIELDS.endedAt.universalIdentifier,
  AGENT_TURN_FIELDS.modelId.universalIdentifier,
  AGENT_TURN_FIELDS.inputTokens.universalIdentifier,
  AGENT_TURN_FIELDS.outputTokens.universalIdentifier,
  AGENT_TURN_FIELDS.cacheReadTokens.universalIdentifier,
  AGENT_TURN_FIELDS.cacheCreationTokens.universalIdentifier,
  AGENT_TURN_FIELDS.inputCredits.universalIdentifier,
  AGENT_TURN_FIELDS.outputCredits.universalIdentifier,
  AGENT_TURN_FIELDS.createdBy.universalIdentifier,
];

// Existing turns take the completed default, except the one holding a
// conversation's open question, which still waits on its answer
@RegisteredWorkspaceCommand('2.46.0', 1791227584393)
@Command({
  name: 'upgrade:2-46:add-agent-turn-run-fields',
  description:
    'Add the status, timing, model, usage and creator of each agent turn',
})
export class AddAgentTurnRunFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentTurn.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentTurn object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: RUN_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would create ${fieldsToCreate.length} agentTurn field(s) and mark waiting turns for workspace ${workspaceId}`,
      );

      return;
    }

    // a rerun after a failed backfill finds the fields already there and must still mark the turns
    if (fieldsToCreate.length > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: fieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to create the agentTurn run fields for workspace ${workspaceId}`,
        );
      }
    }

    const waitingTurnCount = await this.storage.run(
      workspaceId,
      async ({ manager, table }) => {
        const waitingTurns: { id: string }[] = await manager.query(
          `UPDATE ${table('agentTurn')} turn SET "status" = 'waiting_for_input', "endedAt" = NULL
           FROM ${table('agentChatThread')} thread
           JOIN ${table('agentMessage')} message ON message.id = thread."pendingQuestionMessageId"
           WHERE turn.id = message."turnId"
           RETURNING turn.id`,
        );

        return waitingTurns.length;
      },
    );

    this.logger.log(
      `Workspace ${workspaceId}: created ${fieldsToCreate.length} agentTurn field(s) and marked ${waitingTurnCount} turn(s) as waiting`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const fieldsToDelete = RUN_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);

    if (fieldsToDelete.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would delete ${fieldsToDelete.length} agentTurn field(s) for workspace ${workspaceId}`,
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
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: fieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to delete the agentTurn run fields for workspace ${workspaceId}`,
      );
    }
  }
}
