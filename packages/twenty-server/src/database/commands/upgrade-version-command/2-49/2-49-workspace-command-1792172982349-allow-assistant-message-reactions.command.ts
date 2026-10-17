import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

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

const REACTION = STANDARD_OBJECTS.agentMessageReaction;
const WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER =
  REACTION.fields.workspaceMember.universalIdentifier;
const AGENT_ID_FIELD_UNIVERSAL_IDENTIFIER =
  REACTION.fields.agentId.universalIdentifier;

@RegisteredWorkspaceCommand('2.49.0', 1792172982349)
@Command({
  name: 'upgrade:2-49:allow-assistant-message-reactions',
  description:
    'Let a chat message reaction belong to an agent or the assistant instead of a workspace member',
})
export class AllowAssistantMessageReactionsCommand extends ProvisionedWorkspaceCommandRunner {
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

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setWorkspaceMemberNullable({ ...args, isNullable: true });
    await this.addAgentIdField(args);
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.removeAgentIdField(args);
    await this.setWorkspaceMemberNullable({ ...args, isNullable: false });
  }

  private async addAgentIdField({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          REACTION.universalIdentifier
        ],
      ) ||
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          AGENT_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would add the agentMessageReaction agentId field for workspace ${workspaceId}`,
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

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate:
                getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
                  standardFlatEntityMaps:
                    standardAllFlatEntityMaps.flatFieldMetadataMaps,
                  existingFlatEntityMaps: flatFieldMetadataMaps,
                  universalIdentifiers: [AGENT_ID_FIELD_UNIVERSAL_IDENTIFIER],
                }),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add the agentMessageReaction agentId field for workspace ${workspaceId}`,
      );
    }
  }

  private async removeAgentIdField({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const agentIdField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>(
      {
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: AGENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      },
    );

    if (!isDefined(agentIdField)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would remove the agentMessageReaction agentId field for workspace ${workspaceId}`,
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
              flatEntityToDelete: [agentIdField],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to remove the agentMessageReaction agentId field for workspace ${workspaceId}`,
      );
    }
  }

  private async setWorkspaceMemberNullable({
    workspaceId,
    options,
    dataSource,
    isNullable,
  }: RunOnWorkspaceArgs & { isNullable: boolean }): Promise<void> {
    if (!isDefined(dataSource) || (options.dryRun ?? false)) {
      return;
    }

    const reactionTable = `"${getWorkspaceSchemaName(workspaceId)}"."agentMessageReaction"`;
    const [table] = await dataSource.query('SELECT to_regclass($1) AS name', [
      reactionTable,
    ]);

    if (!isDefined(table?.name)) {
      return;
    }

    if (!isNullable) {
      await dataSource.query(
        `DELETE FROM ${reactionTable} WHERE "workspaceMemberId" IS NULL`,
      );
    }

    await dataSource.query(
      `ALTER TABLE ${reactionTable} ALTER COLUMN "workspaceMemberId" ${isNullable ? 'DROP' : 'SET'} NOT NULL`,
    );
    await dataSource.query(
      `UPDATE core."fieldMetadata" SET "isNullable" = $1
       WHERE "workspaceId" = $2 AND "universalIdentifier" = $3`,
      [isNullable, workspaceId, WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER],
    );
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
    ]);
  }
}
