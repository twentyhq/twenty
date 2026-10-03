import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

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
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const CONTEXT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentTurn.fields.context.universalIdentifier;

const getTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    turn: `${schema}."agentTurn"`,
    message: `${schema}."agentMessage"`,
    messagePart: `${schema}."agentMessagePart"`,
  };
};

// A hidden message was the user message of a turn the agent opened: the
// workspace setup kickoff, or the opener of an application's inbox thread
const moveHiddenMessagesToTurnContext = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}) => {
  const tables = getTables(workspaceId);

  const [, turnCount]: [unknown[], number] = await manager.query(
    `UPDATE ${tables.turn} turn
     SET context = hidden.text
     FROM (
       SELECT message."turnId", string_agg(part."textContent", E'\n\n' ORDER BY message."createdAt", part."orderIndex") AS text
       FROM ${tables.message} message
       JOIN ${tables.messagePart} part ON part."messageId" = message.id
       WHERE message."isHidden" = true AND message."deletedAt" IS NULL
         AND part.type = 'text' AND part."textContent" IS NOT NULL
       GROUP BY message."turnId"
     ) hidden
     WHERE turn.id = hidden."turnId" AND turn.context IS NULL`,
  );

  await manager.query(
    `DELETE FROM ${tables.messagePart} part
     USING ${tables.message} message
     WHERE part."messageId" = message.id AND message."isHidden" = true`,
  );

  const [, messageCount]: [unknown[], number] = await manager.query(
    `DELETE FROM ${tables.message} WHERE "isHidden" = true`,
  );

  return { turnCount, messageCount };
};

const moveTurnContextToHiddenMessages = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}) => {
  const tables = getTables(workspaceId);

  const [, messageCount]: [unknown[], number] = await manager.query(
    `WITH hidden AS (
       INSERT INTO ${tables.message} (id, "threadId", "turnId", role, status, "isHidden", "processedAt", "createdAt")
       SELECT public.uuid_generate_v4(), turn."threadId", turn.id, 'user', 'sent', true, turn."createdAt", turn."createdAt"
       FROM ${tables.turn} turn
       WHERE turn.context IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM ${tables.message} message
           WHERE message."threadId" = turn."threadId" AND message."isHidden" = true AND message."deletedAt" IS NULL
         )
       RETURNING id, "turnId"
     )
     INSERT INTO ${tables.messagePart} ("messageId", "orderIndex", type, "textContent")
     SELECT hidden.id, 0, 'text', turn.context
     FROM hidden
     JOIN ${tables.turn} turn ON turn.id = hidden."turnId"`,
  );

  return messageCount;
};

@RegisteredWorkspaceCommand('2.46.0', 1791049424391)
@Command({
  name: 'upgrade:2-46:move-hidden-agent-messages-to-turn-context',
  description:
    'Add the context of agent turns and move hidden chat messages into it',
})
export class MoveHiddenAgentMessagesToTurnContextCommand extends ProvisionedWorkspaceCommandRunner {
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

    // Workspaces without chat history objects get the field when the 2.42
    // history move provisions them, and have no hidden message to move
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThread object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would add the agent turn context and move hidden chat messages into it for workspace ${workspaceId}`,
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
        universalIdentifiers: [CONTEXT_FIELD_UNIVERSAL_IDENTIFIER],
      });

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
          `Failed to add the agent turn context for workspace ${workspaceId}`,
        );
      }
    }

    const { turnCount, messageCount } = await this.storage.run(
      workspaceId,
      ({ manager }) => moveHiddenMessagesToTurnContext({ manager, workspaceId }),
    );

    this.logger.log(
      `Workspace ${workspaceId}: moved ${messageCount} hidden chat message(s) into the context of ${turnCount} turn(s)`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const contextField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>(
      {
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: CONTEXT_FIELD_UNIVERSAL_IDENTIFIER,
      },
    );

    if (!isDefined(contextField)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would move the agent turn context back to hidden chat messages and delete it for workspace ${workspaceId}`,
      );

      return;
    }

    const messageCount = await this.storage.run(workspaceId, ({ manager }) =>
      moveTurnContextToHiddenMessages({ manager, workspaceId }),
    );

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
              flatEntityToDelete: [contextField],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to delete the agent turn context for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Workspace ${workspaceId}: moved the context of ${messageCount} turn(s) back to hidden messages`,
    );
  }
}
