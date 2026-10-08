import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.isSubscribed
    .universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastMentionedAt
    .universalIdentifier,
];

const SUBSCRIPTION_COMMAND_MENU_ITEM_NAMES = [
  'subscribeToAiChat',
  'unsubscribeFromAiChat',
] as const;

// Runs after the inbox backfill and the agentTurn run fields, so runtime reads
// isSubscribed as one sign they are in place. Every existing row is a
// subscription, which the default keeps.
@RegisteredWorkspaceCommand('2.46.0', 1791322315043)
@Command({
  name: 'upgrade:2-46:add-agent-chat-thread-subscriptions',
  description:
    'Add the subscription and last mention of chat participants, and the Subscribe and Unsubscribe commands',
})
export class AddAgentChatThreadSubscriptionsCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatCommandMenuItemMaps',
    ]);

    const hasParticipantObject = isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
      ],
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fieldsToCreate = hasParticipantObject
      ? getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
          standardFlatEntityMaps: computeTwentyStandardApplicationAllFlatEntityMaps(
            {
              now: new Date().toISOString(),
              workspaceId,
              twentyStandardApplicationId: twentyStandardFlatApplication.id,
            },
          ).allFlatEntityMaps.flatFieldMetadataMaps,
          existingFlatEntityMaps: flatFieldMetadataMaps,
          universalIdentifiers: SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIERS,
        })
      : [];

    const commandMenuItemsToCreate =
      buildMissingStandardCommandMenuItemsToCreate({
        commandMenuItemNames: [...SUBSCRIPTION_COMMAND_MENU_ITEM_NAMES],
        flatCommandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        flatObjectMetadataMaps,
        workspaceId,
        now: new Date().toISOString(),
      });

    if (fieldsToCreate.length + commandMenuItemsToCreate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${fieldsToCreate.length} chat participant field(s) and ${commandMenuItemsToCreate.length} command menu item(s)`,
    );

    if (options.dryRun ?? false) {
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
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add chat subscriptions for workspace ${workspaceId}`,
      );
    }
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatCommandMenuItemMaps',
      ]);

    const fieldsToDelete = SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const commandMenuItemsToDelete = SUBSCRIPTION_COMMAND_MENU_ITEM_NAMES.map(
      (name) =>
        flatCommandMenuItemMaps.byUniversalIdentifier[
          STANDARD_COMMAND_MENU_ITEMS[name].universalIdentifier
        ],
    ).filter(isDefined);

    if (fieldsToDelete.length + commandMenuItemsToDelete.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: deleting ${fieldsToDelete.length} chat participant field(s) and ${commandMenuItemsToDelete.length} command menu item(s)`,
    );

    if (options.dryRun ?? false) {
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
              flatEntityToCreate: [],
              flatEntityToDelete: fieldsToDelete,
              flatEntityToUpdate: [],
            },
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: commandMenuItemsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to remove chat subscriptions for workspace ${workspaceId}`,
      );
    }
  }
}
