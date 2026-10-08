import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { getBackfillTables } from 'src/database/commands/upgrade-version-command/2-46/utils/backfill-agent-chat-thread-inbox-state.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DONE_AT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.doneAt.universalIdentifier;

// archivedAt keeps its column: the earlier 2.46 commands still create and
// write it on workspaces they have not reached. It is emptied as it moves,
// so running up again cannot bring back a done state the member has since
// cleared. Runtime reads doneAt as the sign this ran.
@RegisteredWorkspaceCommand('2.46.0', 1791416060804)
@Command({
  name: 'upgrade:2-46:add-agent-chat-thread-participant-done-at',
  description:
    'Move the done, snooze and unsubscribe time of chat participants from archivedAt to doneAt',
})
export class AddAgentChatThreadParticipantDoneAtCommand extends ProvisionedWorkspaceCommandRunner {
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

    // Workspaces without the participant object get doneAt along with it
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThreadParticipant object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: computeTwentyStandardApplicationAllFlatEntityMaps(
          {
            now: new Date().toISOString(),
            workspaceId,
            twentyStandardApplicationId: twentyStandardFlatApplication.id,
          },
        ).allFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [DONE_AT_FIELD_UNIVERSAL_IDENTIFIER],
      });

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would create ${fieldsToCreate.length} chat participant field(s) and move archivedAt to doneAt for workspace ${workspaceId}`,
      );

      return;
    }

    await this.runFieldMigration({
      workspaceId,
      flatEntityToCreate: fieldsToCreate,
      flatEntityToDelete: [],
    });

    const { participant } = getBackfillTables(workspaceId);
    const [, movedCount]: [unknown[], number] = await this.storage.run(
      workspaceId,
      ({ manager }) =>
        manager.query(
          `UPDATE ${participant}
           SET "doneAt" = COALESCE("doneAt", "archivedAt"), "archivedAt" = NULL
           WHERE "archivedAt" IS NOT NULL`,
        ),
    );

    this.logger.log(
      `Workspace ${workspaceId}: created ${fieldsToCreate.length} chat participant field(s), moved ${movedCount} archivedAt value(s) to doneAt`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const doneAtField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>(
      {
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: DONE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      },
    );

    if (!isDefined(doneAtField)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would move doneAt back to archivedAt and delete doneAt for workspace ${workspaceId}`,
      );

      return;
    }

    const { participant } = getBackfillTables(workspaceId);

    await this.storage.run(workspaceId, ({ manager }) =>
      manager.query(
        `UPDATE ${participant}
         SET "archivedAt" = "doneAt"
         WHERE "doneAt" IS NOT NULL`,
      ),
    );

    await this.runFieldMigration({
      workspaceId,
      flatEntityToCreate: [],
      flatEntityToDelete: [doneAtField],
    });

    this.logger.log(
      `Workspace ${workspaceId}: moved doneAt back to archivedAt and deleted doneAt`,
    );
  }

  private async runFieldMigration({
    workspaceId,
    flatEntityToCreate,
    flatEntityToDelete,
  }: {
    workspaceId: string;
    flatEntityToCreate: FlatFieldMetadata[];
    flatEntityToDelete: FlatFieldMetadata[];
  }): Promise<void> {
    if (flatEntityToCreate.length + flatEntityToDelete.length === 0) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate,
              flatEntityToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to update the chat participant doneAt field for workspace ${workspaceId}`,
      );
    }
  }
}
