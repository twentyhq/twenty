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
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.assignee.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.assignedAgentChatThreads
    .universalIdentifier,
];

const ASSIGNEE_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.indexes.assigneeIndex.universalIdentifier,
];

const ASSIGNEE_COMMAND_MENU_ITEM_NAMES = ['assignAiChat'] as const;

@RegisteredWorkspaceCommand('2.46.0', 1791324440418)
@Command({
  name: 'upgrade:2-46:add-agent-chat-thread-assignee',
  description: 'Add the assignee of chat threads and the Assign command',
})
export class AddAgentChatThreadAssigneeCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatCommandMenuItemMaps',
    ]);

    // Workspaces without chat history objects get the assignee when the 2.42
    // history move provisions them
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
        universalIdentifiers: ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIERS,
      });
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: ASSIGNEE_INDEX_UNIVERSAL_IDENTIFIERS,
      });
    const commandMenuItemsToCreate =
      buildMissingStandardCommandMenuItemsToCreate({
        commandMenuItemNames: [...ASSIGNEE_COMMAND_MENU_ITEM_NAMES],
        flatCommandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        flatObjectMetadataMaps,
        workspaceId,
        now: new Date().toISOString(),
      });

    const operationCount =
      fieldsToCreate.length +
      indexesToCreate.length +
      commandMenuItemsToCreate.length;

    if (operationCount === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${fieldsToCreate.length} field(s), ${indexesToCreate.length} index(es) and ${commandMenuItemsToCreate.length} command menu item(s) for chat assignees`,
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
            index: {
              flatEntityToCreate: indexesToCreate,
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
        `Failed to add chat assignees for workspace ${workspaceId}`,
      );
    }
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatIndexMaps, flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'flatCommandMenuItemMaps',
      ]);

    const fieldsToDelete = ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const indexesToDelete = ASSIGNEE_INDEX_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const commandMenuItemsToDelete = ASSIGNEE_COMMAND_MENU_ITEM_NAMES.map(
      (name) =>
        flatCommandMenuItemMaps.byUniversalIdentifier[
          STANDARD_COMMAND_MENU_ITEMS[name].universalIdentifier
        ],
    ).filter(isDefined);

    if (
      fieldsToDelete.length +
        indexesToDelete.length +
        commandMenuItemsToDelete.length ===
      0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: deleting ${fieldsToDelete.length} field(s), ${indexesToDelete.length} index(es) and ${commandMenuItemsToDelete.length} command menu item(s) of chat assignees`,
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
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: indexesToDelete,
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
        `Failed to remove chat assignees for workspace ${workspaceId}`,
      );
    }
  }
}
