import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastResolvedMentionAt
    .universalIdentifier;
const PARTICIPANT_BATCH_SIZE = 1000;

@RegisteredWorkspaceCommand('2.52.0', 1792768675515)
@Command({
  name: 'upgrade:2-52:add-chat-mention-resolution',
  description:
    'Track resolved chat mentions and recover proven historical replies',
})
export class AddChatMentionResolutionCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
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
          STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
        ],
      )
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: add mention resolution and recover mentions answered by their recipient`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps:
          computeTwentyStandardApplicationAllFlatEntityMaps({
            now: new Date().toISOString(),
            workspaceId,
            twentyStandardApplicationId: twentyStandardFlatApplication.id,
          }).allFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER],
      });

    if (fieldsToCreate.length > 0) {
      await this.migrateFields({
        workspaceId,
        fieldsToCreate,
        fieldsToDelete: [],
      });
    }

    await this.resolveProvenHistoricalReplies(workspaceId);
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const field =
      flatFieldMetadataMaps.byUniversalIdentifier[
        RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(field) || options.dryRun) {
      return;
    }

    await this.migrateFields({
      workspaceId,
      fieldsToCreate: [],
      fieldsToDelete: [field],
    });
  }

  private async migrateFields({
    workspaceId,
    fieldsToCreate,
    fieldsToDelete,
  }: {
    workspaceId: string;
    fieldsToCreate: FlatFieldMetadata[];
    fieldsToDelete: FlatFieldMetadata[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: fieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to migrate chat mention resolution for workspace ${workspaceId}`,
      );
    }
  }

  private async resolveProvenHistoricalReplies(
    workspaceId: string,
  ): Promise<void> {
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    let candidateCount: number;

    do {
      const [batch] = await this.dataSource.query<{ candidateCount: number }[]>(
        `WITH answered_mentions AS (
           SELECT participant.id, participant."lastMentionedAt"
           FROM ${schema}."agentChatThreadParticipant" participant
           WHERE participant."deletedAt" IS NULL
             AND participant."lastMentionedAt" IS NOT NULL
             AND (participant."lastResolvedMentionAt" IS NULL
               OR participant."lastMentionedAt" > participant."lastResolvedMentionAt")
             AND EXISTS (
               SELECT 1 FROM ${schema}."agentMessage" message
               JOIN ${schema}."agentTurn" member_turn
                 ON member_turn.id = message."turnId"
                 AND member_turn."threadId" = message."threadId"
                 AND member_turn."agentId" IS NULL
                 AND member_turn."deletedAt" IS NULL
               WHERE message."threadId" = participant."threadId"
                 AND message."senderWorkspaceMemberId" = participant."workspaceMemberId"
                 AND message.role = 'user'
                 AND message."deletedAt" IS NULL
                 AND message."createdAt" > participant."lastMentionedAt"
             )
           ORDER BY participant.id
           LIMIT ${PARTICIPANT_BATCH_SIZE}
         ), resolved_mentions AS (
         UPDATE ${schema}."agentChatThreadParticipant" participant
         SET "lastResolvedMentionAt" = answered_mentions."lastMentionedAt", "updatedAt" = GREATEST(clock_timestamp(), participant."updatedAt" + interval '1 millisecond')
         FROM answered_mentions
         WHERE participant.id = answered_mentions.id
           AND participant."lastMentionedAt" = answered_mentions."lastMentionedAt"
           AND (participant."lastResolvedMentionAt" IS NULL
             OR participant."lastResolvedMentionAt" < answered_mentions."lastMentionedAt")
         RETURNING participant.id
         )
         SELECT COUNT(*)::int AS "candidateCount" FROM answered_mentions`,
      );

      candidateCount = batch.candidateCount;
    } while (candidateCount === PARTICIPANT_BATCH_SIZE);
  }
}
