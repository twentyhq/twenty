import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const THREAD_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelArchivedAt.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelSnoozedUntil
    .universalIdentifier,
];

const THREAD_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.indexes.channelLastActivityIndex
    .universalIdentifier,
];

const CHANNEL_UNIVERSAL_IDENTIFIERS = [
  STANDARD_AGENT_CHAT_CHANNEL.general.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.51.0', 1792686629823)
@Command({
  name: 'upgrade:2-51:add-agent-chat-channels',
  description: 'Give chat threads a channel and create the General channel',
})
export class AddAgentChatChannelsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatAgentChatChannelMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatAgentChatChannelMaps',
    ]);

    // Workspaces without chat history objects get the thread fields when the
    // 2.42 history move provisions them, and General with the standard sync
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
        universalIdentifiers: THREAD_FIELD_UNIVERSAL_IDENTIFIERS,
      });
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: THREAD_INDEX_UNIVERSAL_IDENTIFIERS,
      });
    const channelsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatAgentChatChannel>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatAgentChatChannelMaps,
        existingFlatEntityMaps: flatAgentChatChannelMaps,
        universalIdentifiers: CHANNEL_UNIVERSAL_IDENTIFIERS,
      });

    const operationCount =
      fieldsToCreate.length + indexesToCreate.length + channelsToCreate.length;

    if (operationCount === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${fieldsToCreate.length} field(s), ${indexesToCreate.length} index(es) and ${channelsToCreate.length} channel(s) for chat channels`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        fieldMetadata: {
          flatEntityToCreate: fieldsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
        index: {
          flatEntityToCreate: indexesToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
        agentChatChannel: {
          flatEntityToCreate: channelsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatIndexMaps, flatAgentChatChannelMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'flatAgentChatChannelMaps',
      ]);

    const fieldsToDelete = THREAD_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const indexesToDelete = THREAD_INDEX_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const channelsToDelete = CHANNEL_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatAgentChatChannel>({
          flatEntityMaps: flatAgentChatChannelMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);

    if (
      fieldsToDelete.length +
        indexesToDelete.length +
        channelsToDelete.length ===
      0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: deleting ${fieldsToDelete.length} field(s), ${indexesToDelete.length} index(es) and ${channelsToDelete.length} channel(s) of chat channels`,
    );

    if (options.dryRun) {
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
      allFlatEntityOperationByMetadataName: {
        fieldMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: fieldsToDelete,
          flatEntityToUpdate: [],
        },
        index: {
          flatEntityToCreate: [],
          flatEntityToDelete: indexesToDelete,
          flatEntityToUpdate: [],
        },
        agentChatChannel: {
          flatEntityToCreate: [],
          flatEntityToDelete: channelsToDelete,
          flatEntityToUpdate: [],
        },
      },
    });
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
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to change chat channels for workspace ${args.workspaceId}`,
      );
    }
  }
}
