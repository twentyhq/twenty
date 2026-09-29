import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-44/constants/legacy-chat-thread-workflow-step-id-field-universal-identifier.constant';
import { buildLegacyChatThreadWorkflowStepIdFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/2-44/utils/build-legacy-chat-thread-workflow-step-id-flat-field-metadata.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Workspaces that ran 2.44's add-workflow-run-to-chat-threads before it
// stopped creating agentChatThread.workflowStepId hold a field nothing reads:
// a run conversation's step is found from the run state instead.
@RegisteredWorkspaceCommand('2.44.0', 1790677027260)
@Command({
  name: 'upgrade:2-44:drop-chat-thread-workflow-step-id',
  description:
    'Remove the agentChatThread workflowStepId field, now that a run conversation is matched to its step through the run state',
})
export class DropChatThreadWorkflowStepIdCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const workflowStepIdField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(workflowStepIdField)) {
      this.logger.log(
        `Workspace ${workspaceId} has no agentChatThread workflowStepId field, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop the agentChatThread workflowStepId field for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      fieldMetadata: {
        flatEntityToCreate: [],
        flatEntityToDelete: [workflowStepIdField],
        flatEntityToUpdate: [],
      },
    });

    this.logger.log(
      `Dropped the agentChatThread workflowStepId field for workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    if (
      !isDefined(threadObject) ||
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // Only the empty column comes back: what it held is in the run state.
    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      fieldMetadata: {
        flatEntityToCreate: [
          buildLegacyChatThreadWorkflowStepIdFlatFieldMetadata({
            workspaceId,
            applicationId: twentyStandardFlatApplication.id,
            threadObjectMetadataId: threadObject.id,
            now: new Date().toISOString(),
          }),
        ],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    });
  }

  private async runMigration({
    workspaceId,
    applicationUniversalIdentifier,
    fieldMetadata,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    fieldMetadata: {
      flatEntityToCreate: FlatFieldMetadata[];
      flatEntityToDelete: FlatFieldMetadata[];
      flatEntityToUpdate: FlatFieldMetadata[];
    };
  }): Promise<void> {
    const migrationResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: { fieldMetadata },
        },
      );

    if (migrationResult.status === 'fail') {
      throw new Error(
        `Failed to migrate the agentChatThread workflowStepId field for workspace ${workspaceId}:\n${JSON.stringify(
          migrationResult,
          null,
          2,
        )}`,
      );
    }
  }
}
