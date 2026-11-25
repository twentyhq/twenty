import { Command } from 'nest-commander';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import {
  CREATE_CORE_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RUN_WORKFLOW_FIELD_UNIVERSAL_IDENTIFIER,
  WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER,
  WORKFLOW_VERSION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-58/constants/core-workflow-metadata-universal-identifiers.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.58.0', 1794269047171)
@Command({
  name: 'upgrade:2-58:add-core-workflow-metadata',
  description:
    'Show the workflow run core workflow field and add the core workflow command menu items',
})
export class AddCoreWorkflowMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const {
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatViewMaps',
      'flatCommandMenuItemMaps',
    ]);

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

    const coreWorkflowIdField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER
      ];
    const standardCoreWorkflowIdField =
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER
      ];
    const shouldShowCoreWorkflowIdField =
      isDefined(coreWorkflowIdField) &&
      isDefined(standardCoreWorkflowIdField) &&
      coreWorkflowIdField.isSystem;

    const viewFieldsToCreate = isDefined(coreWorkflowIdField)
      ? getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          existingFlatEntityMaps: flatViewFieldMaps,
          universalIdentifiers: Object.values(
            standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .filter(
              ({ fieldMetadataUniversalIdentifier, viewUniversalIdentifier }) =>
                fieldMetadataUniversalIdentifier ===
                  WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER &&
                isDefined(
                  flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
                ),
            )
            .map(({ universalIdentifier }) => universalIdentifier),
        })
      : [];

    // The legacy relation column would otherwise sit next to the new one with the same label.
    const viewFieldsToUpdate = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((viewField) => {
        const standardViewField =
          standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
            viewField.universalIdentifier
          ];

        if (
          viewField.fieldMetadataUniversalIdentifier !==
            LEGACY_WORKFLOW_RUN_WORKFLOW_FIELD_UNIVERSAL_IDENTIFIER ||
          !isDefined(standardViewField) ||
          viewField.isVisible === standardViewField.isVisible
        ) {
          return [];
        }

        return [{ ...viewField, isVisible: standardViewField.isVisible }];
      });

    const commandMenuItemsToUpdate =
      WORKFLOW_VERSION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
        (universalIdentifier) => {
          const commandMenuItem =
            flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];
          const standardCommandMenuItem =
            standardAllFlatEntityMaps.flatCommandMenuItemMaps
              .byUniversalIdentifier[universalIdentifier];

          if (
            !isDefined(commandMenuItem) ||
            !isDefined(standardCommandMenuItem) ||
            commandMenuItem.conditionalAvailabilityExpression ===
              standardCommandMenuItem.conditionalAvailabilityExpression
          ) {
            return [];
          }

          return [
            {
              ...commandMenuItem,
              conditionalAvailabilityExpression:
                standardCommandMenuItem.conditionalAvailabilityExpression,
            },
          ];
        },
      );

    const commandMenuItemsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatCommandMenuItem>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatCommandMenuItemMaps,
        existingFlatEntityMaps: flatCommandMenuItemMaps,
        universalIdentifiers: [
          CREATE_CORE_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        ],
      });

    const metadataChangeCount =
      viewFieldsToCreate.length +
      viewFieldsToUpdate.length +
      commandMenuItemsToCreate.length +
      commandMenuItemsToUpdate.length;

    if (!shouldShowCoreWorkflowIdField && metadataChangeCount === 0) {
      return;
    }

    const plan = `${shouldShowCoreWorkflowIdField ? 1 : 0} field to show, ${viewFieldsToCreate.length} view field(s) and ${commandMenuItemsToCreate.length} command menu item(s) to create, ${viewFieldsToUpdate.length} legacy view field(s) to hide, ${commandMenuItemsToUpdate.length} command menu item(s) to update`;

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would apply ${plan} for workspace ${workspaceId}`,
      );

      return;
    }

    if (shouldShowCoreWorkflowIdField) {
      // isSystem is not updatable through a metadata migration
      await dataSource.query(
        `UPDATE core."fieldMetadata"
         SET "isSystem" = $1, label = $2, description = $3, "updatedAt" = NOW()
         WHERE "workspaceId" = $4 AND id = $5`,
        [
          standardCoreWorkflowIdField.isSystem,
          standardCoreWorkflowIdField.label,
          standardCoreWorkflowIdField.description,
          workspaceId,
          coreWorkflowIdField.id,
        ],
      );

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    }

    if (metadataChangeCount > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            workspaceId,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
            shouldDeferActions: false,
            isSystemBuild: true,
            allFlatEntityOperationByMetadataName: {
              viewField: {
                flatEntityToCreate: viewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: viewFieldsToUpdate,
              },
              commandMenuItem: {
                flatEntityToCreate: commandMenuItemsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: commandMenuItemsToUpdate,
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          doNotTranslate(
            `Failed to add the core workflow metadata for workspace ${workspaceId}`,
          ),
        );
      }
    }

    this.logger.log(`Applied ${plan} for workspace ${workspaceId}`);
  }
}
