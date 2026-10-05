import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Kept as literals because the entries they used to name have been removed
// from the standard objects in the same change.
const CHAT_THREAD_WORKFLOW_RUN_FIELD_UNIVERSAL_IDENTIFIER =
  '2187f4c6-bff3-4b80-8585-c82965faf79b';
const WORKFLOW_RUN_AGENT_CHAT_THREADS_FIELD_UNIVERSAL_IDENTIFIER =
  'c664a2e7-ef64-4597-9cdf-ded3eae85ae4';
const CHAT_THREAD_WORKFLOW_RUN_INDEX_UNIVERSAL_IDENTIFIER =
  'cc9f8c37-a1ad-4d8d-8e27-894c2cf01a3b';

// A call still waiting in a run's conversation gets the step it waits for,
// which is how an answer or a wait outcome finds its step once the thread no
// longer names its run.
const stampPendingCallsWithTheirStep = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  const stamped: { id: string }[] = await manager.query(
    `UPDATE ${schema}."agentMessagePart" part
     SET "toolOutput" = part."toolOutput" || jsonb_build_object(
       'workflowStep',
       jsonb_build_object('workflowRunId', thread."workflowRunId", 'stepId', step.key)
     )
     FROM ${schema}."agentMessage" message
     JOIN ${schema}."agentChatThread" thread ON thread.id = message."threadId"
     JOIN ${schema}."workflowRun" run ON run.id = thread."workflowRunId"
     CROSS JOIN LATERAL jsonb_each(COALESCE(run.state -> 'stepInfos', '{}'::jsonb)) AS step(key, value)
     WHERE part."messageId" = message.id
       AND step.value ->> 'threadId' = thread.id::text
       AND jsonb_typeof(part."toolOutput") = 'object'
       AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
       AND NOT part."toolOutput" ? 'workflowStep'
     RETURNING part.id`,
  );

  return stamped.length;
};

// A conversation an agent step held now belongs to the member it was routed
// to, as every other conversation does, rather than to its run. The calls it
// still waits on keep resuming their step, and threads read only through their
// own grants again.
@RegisteredWorkspaceCommand('2.46.0', 1791208395308)
@Command({
  name: 'upgrade:2-46:drop-workflow-run-from-chat-threads',
  description:
    'Stop linking chat threads to workflow runs: pending calls name their step, threads become PRIVATE and the run link is dropped',
})
export class DropWorkflowRunFromChatThreadsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    if (!isDefined(threadObject)) {
      this.logger.log(
        `agentChatThread object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const fieldsToDelete = [
      CHAT_THREAD_WORKFLOW_RUN_FIELD_UNIVERSAL_IDENTIFIER,
      WORKFLOW_RUN_AGENT_CHAT_THREADS_FIELD_UNIVERSAL_IDENTIFIER,
    ]
      .map((universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
      )
      .filter(isDefined);
    const indexesToDelete = [
      findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
        flatEntityMaps: flatIndexMaps,
        universalIdentifier:
          CHAT_THREAD_WORKFLOW_RUN_INDEX_UNIVERSAL_IDENTIFIER,
      }),
    ].filter(isDefined);
    const isPrivate =
      threadObject.readability === MetadataReadability.PRIVATE &&
      !isDefined(threadObject.readabilityParentFieldUniversalIdentifiers);

    if (
      isPrivate &&
      fieldsToDelete.length === 0 &&
      indexesToDelete.length === 0
    ) {
      this.logger.log(
        `Chat threads are not linked to workflow runs in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would stamp pending calls, make chat threads PRIVATE and drop ${fieldsToDelete.length} field(s) and ${indexesToDelete.length} index(es) for workspace ${workspaceId}`,
      );

      return;
    }

    const stampedCount = fieldsToDelete.some(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        CHAT_THREAD_WORKFLOW_RUN_FIELD_UNIVERSAL_IDENTIFIER,
    )
      ? await this.storage.run(workspaceId, ({ manager }) =>
          stampPendingCallsWithTheirStep({ manager, workspaceId }),
        )
      : 0;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const applicationUniversalIdentifier =
      twentyStandardFlatApplication.universalIdentifier;

    // Readability names the parent field, so it lets go of it before the field goes
    if (!isPrivate) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              {
                ...threadObject,
                readability: MetadataReadability.PRIVATE,
                readabilityParentFieldUniversalIdentifiers: null,
              },
            ],
          },
        },
      });
    }

    if (fieldsToDelete.length + indexesToDelete.length > 0) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: indexesToDelete,
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: fieldsToDelete,
            flatEntityToUpdate: [],
          },
        },
      });
    }

    this.logger.log(
      `Workspace ${workspaceId}: stamped ${stampedCount} pending call(s), made chat threads PRIVATE and dropped their workflow run link`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The standard objects no longer declare the run link, so it cannot be
    // recreated, and the stamped calls resume their step without it.
  }

  private async runMigration(
    args: Omit<
      Parameters<
        WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
      >[0],
      'isSystemBuild'
    >,
  ): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        { ...args, isSystemBuild: true },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to drop the workflow run link from chat threads for workspace ${args.workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }
  }
}
