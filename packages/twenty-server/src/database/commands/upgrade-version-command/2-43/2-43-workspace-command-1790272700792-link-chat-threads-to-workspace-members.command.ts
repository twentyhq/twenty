import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { buildWorkspaceMemberIdFromUserWorkspaceIdSql } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-thread-owner-sql.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const LEGACY_USER_WORKSPACE_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'bf830886-b6dc-46e9-a229-eecbb0e66032';
const LEGACY_OWNER_INDEX_UNIVERSAL_IDENTIFIER =
  'c97a4c97-266b-490a-a4d6-76274f5de429';

@RegisteredWorkspaceCommand('2.43.0', 1790272700792)
@Command({
  name: 'upgrade:2-43:link-chat-threads-to-workspace-members',
  description:
    'Replace the chat thread userWorkspaceId column with a workspaceMember relation',
})
export class LinkChatThreadsToWorkspaceMembersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly schema: AgentHistorySchemaService,
    private readonly storage: AgentHistoryStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly migrations: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (await this.storage.isEmptyUnprovisionedWorkspace(workspaceId)) {
      return;
    }

    const dryRun = options.dryRun ?? false;

    await this.schema.prepare(workspaceId, dryRun);

    const { flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const legacyField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_USER_WORKSPACE_ID_FIELD_UNIVERSAL_IDENTIFIER
      ];
    const ownerField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.workspaceMember
          .universalIdentifier
      ];

    if (!isDefined(ownerField)) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `Would move chat thread owners to workspace members for ${workspaceId}`,
      );

      return;
    }

    const lockRunner = this.dataSource.createQueryRunner('master');

    try {
      await lockRunner.connect();
      await lockRunner.startTransaction();
      // Chat traffic and history migrations wait while ownership moves. The
      // lock connection itself touches no table, so the DDL below cannot
      // deadlock against it.
      await lockRunner.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:runner:${workspaceId}`],
      );
      await lockRunner.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:${workspaceId}`],
      );

      const threadTable = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThread"`;

      if (isDefined(legacyField)) {
        await this.dataSource.query(
          `UPDATE ${threadTable} thread SET "workspaceMemberId" = ${buildWorkspaceMemberIdFromUserWorkspaceIdSql(
            {
              workspaceId,
              userWorkspaceIdSql: 'thread."userWorkspaceId"',
            },
          )} WHERE thread."workspaceMemberId" IS NULL`,
        );

        const legacyIndex =
          flatIndexMaps.byUniversalIdentifier[
            LEGACY_OWNER_INDEX_UNIVERSAL_IDENTIFIER
          ];

        await this.runMigrationOrThrow(workspaceId, {
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: isDefined(legacyIndex) ? [legacyIndex] : [],
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [legacyField],
            flatEntityToUpdate: [],
          },
        });
      }

      // Runs only once the legacy column is gone, so a failed drop never
      // loses a thread, and on every run so an interrupted one is finished.
      // Their owner left the workspace and no one can reach them; the removed
      // userWorkspace cascade used to delete them.
      const orphans: { id: string }[] = await this.dataSource.query(
        `DELETE FROM ${threadTable} WHERE "workspaceMemberId" IS NULL RETURNING id`,
      );

      if (orphans.length > 0) {
        this.logger.log(
          `Deleted ${orphans.length} chat thread(s) whose owner left workspace ${workspaceId}`,
        );
      }

      await lockRunner.commitTransaction();
    } catch (error) {
      if (lockRunner.isTransactionActive) {
        await lockRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await lockRunner.release();
    }
  }

  private async runMigrationOrThrow(
    workspaceId: string,
    allFlatEntityOperationByMetadataName: Parameters<
      WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
    >[0]['allFlatEntityOperationByMetadataName'],
  ): Promise<void> {
    const result =
      await this.migrations.validateBuildAndRunLegacyWorkspaceMigration({
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName,
      });

    if (result.status === 'fail') {
      throw new Error(
        `Could not move chat thread owners to workspace members for ${workspaceId}: ${JSON.stringify(result)}`,
      );
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // Threads now reference members inside the workspace schema. Recreating the
    // membership column would require the cross-schema lookup this removes.
  }
}
