import { Command } from 'nest-commander';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import {
  CREATE_CORE_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_ID_INDEX_UNIVERSAL_IDENTIFIERS,
  LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS,
  WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER,
  WORKFLOW_VERSION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-57/constants/legacy-workspace-workflow-universal-identifiers.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.57.0', 1793971872390)
@Command({
  name: 'upgrade:2-57:drop-workspace-workflow-object',
  description:
    'Drop the workspace workflow and workflowAutomatedTrigger objects now that workflows live in core',
})
export class DropWorkspaceWorkflowObjectCommand extends ProvisionedWorkspaceCommandRunner {
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
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping the workflow object drop`,
      );

      return;
    }

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatPageLayoutWidgetMaps,
      flatViewFieldMaps,
      flatViewMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewFieldMaps',
      'flatViewMaps',
      'flatCommandMenuItemMaps',
    ]);

    const objectsToDelete = [
      LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
      LEGACY_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
    ]
      .map(
        (universalIdentifier) =>
          flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined);
    const deletedObjectIds = new Set(objectsToDelete.map(({ id }) => id));

    const fieldsToDelete = Object.values(flatFieldMetadataMaps.byUniversalIdentifier).filter(isDefined).filter(
      (field) =>
        !deletedObjectIds.has(field.objectMetadataId) &&
        (LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS.includes(
          field.universalIdentifier,
        ) ||
          (isDefined(field.relationTargetObjectMetadataId) &&
            deletedObjectIds.has(field.relationTargetObjectMetadataId))),
    );
    const deletedFieldIds = new Set(fieldsToDelete.map(({ id }) => id));

    const indexesToDelete = Object.values(flatIndexMaps.byUniversalIdentifier).filter(isDefined).filter(
      (index) =>
        !deletedObjectIds.has(index.objectMetadataId) &&
        (LEGACY_WORKFLOW_ID_INDEX_UNIVERSAL_IDENTIFIERS.includes(
          index.universalIdentifier,
        ) ||
          index.flatIndexFieldMetadatas.some(({ fieldMetadataId }) =>
            deletedFieldIds.has(fieldMetadataId),
          )),
    );

    // Field widgets keep their field id in their configuration, out of reach of foreign keys.
    const pageLayoutWidgetsToDelete = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (widget) =>
          isDefined(widget.configuration) &&
          'fieldMetadataId' in widget.configuration &&
          deletedFieldIds.has(widget.configuration.fieldMetadataId),
      );

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

    const coreWorkflowIdField = flatFieldMetadataMaps.byUniversalIdentifier[
      WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER
    ];
    const standardCoreWorkflowIdField = standardAllFlatEntityMaps
      .flatFieldMetadataMaps.byUniversalIdentifier[
      WORKFLOW_RUN_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER
    ];
    const fieldsToUpdate =
      isDefined(coreWorkflowIdField) &&
      isDefined(standardCoreWorkflowIdField) &&
      coreWorkflowIdField.isSystem
        ? [
            {
              ...coreWorkflowIdField,
              isSystem: standardCoreWorkflowIdField.isSystem,
              label: standardCoreWorkflowIdField.label,
              description: standardCoreWorkflowIdField.description,
            },
          ]
        : [];

    const viewFieldsToCreate = isDefined(coreWorkflowIdField)
      ? getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          existingFlatEntityMaps: flatViewFieldMaps,
          universalIdentifiers: (
            Object.values(
              standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
            ).filter(isDefined)
          )
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

    const commandMenuItemsToUpdate =
      WORKFLOW_VERSION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
        (universalIdentifier) => {
          const commandMenuItem = flatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ];
          const standardCommandMenuItem = standardAllFlatEntityMaps
            .flatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ];

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

    const hasDeletions =
      objectsToDelete.length +
        fieldsToDelete.length +
        indexesToDelete.length +
        pageLayoutWidgetsToDelete.length >
      0;
    const hasUpdates =
      fieldsToUpdate.length +
        viewFieldsToCreate.length +
        commandMenuItemsToCreate.length +
        commandMenuItemsToUpdate.length >
      0;

    if (!hasDeletions && !hasUpdates) {
      return;
    }

    const legacyDataSummary = await this.summarizeLegacyData({
      workspaceId,
      dataSource,
      workflowObject: objectsToDelete.find(
        ({ universalIdentifier }) =>
          universalIdentifier === LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
      ),
      hasWorkflowAutomatedTriggerObject: objectsToDelete.some(
        ({ universalIdentifier }) =>
          universalIdentifier ===
          LEGACY_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
      ),
      targetWorkflowLinkObjectNames: new Set(
        fieldsToDelete
          .filter(({ name }) => name === 'targetWorkflow')
          .map(
            ({ objectMetadataId }) =>
              findFlatEntityByIdInFlatEntityMaps({
                flatEntityId: objectMetadataId,
                flatEntityMaps: flatObjectMetadataMaps,
              })?.nameSingular,
          )
          .filter(isDefined),
      ),
    });

    const plan = `${objectsToDelete.length} object(s), ${fieldsToDelete.length} field(s), ${indexesToDelete.length} index(es), ${pageLayoutWidgetsToDelete.length} widget(s) holding ${legacyDataSummary}`;
    const metadataChanges = `${fieldsToUpdate.length + commandMenuItemsToUpdate.length} metadata item(s) to update and ${viewFieldsToCreate.length + commandMenuItemsToCreate.length} to create`;

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop ${plan}; ${metadataChanges} for workspace ${workspaceId}`,
      );

      return;
    }

    const applicationUniversalIdentifier =
      twentyStandardFlatApplication.universalIdentifier;

    if (hasDeletions) {
      await this.runMigrationOrThrow({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          pageLayoutWidget: {
            flatEntityToCreate: [],
            flatEntityToDelete: pageLayoutWidgetsToDelete,
            flatEntityToUpdate: [],
          },
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
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: objectsToDelete,
            flatEntityToUpdate: [],
          },
        },
      });
    }

    // isSystem is not updatable through a metadata migration
    for (const field of fieldsToUpdate) {
      await dataSource.query(
        `UPDATE core."fieldMetadata"
         SET "isSystem" = $1, label = $2, description = $3, "updatedAt" = NOW()
         WHERE "workspaceId" = $4 AND id = $5`,
        [
          field.isSystem,
          field.label,
          field.description,
          workspaceId,
          field.id,
        ],
      );
    }

    if (fieldsToUpdate.length > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    }

    if (
      viewFieldsToCreate.length +
        commandMenuItemsToCreate.length +
        commandMenuItemsToUpdate.length >
      0
    ) {
      await this.runMigrationOrThrow({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: viewFieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          commandMenuItem: {
            flatEntityToCreate: commandMenuItemsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: commandMenuItemsToUpdate,
          },
        },
      });
    }

    this.logger.log(
      `Dropped ${plan}; applied ${metadataChanges} for workspace ${workspaceId}`,
    );
  }

  private async summarizeLegacyData({
    workspaceId,
    dataSource,
    workflowObject,
    hasWorkflowAutomatedTriggerObject,
    targetWorkflowLinkObjectNames,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    workflowObject: Pick<FlatObjectMetadata, 'id'> | undefined;
    hasWorkflowAutomatedTriggerObject: boolean;
    targetWorkflowLinkObjectNames: Set<string>;
  }): Promise<string> {
    if (!isDefined(workflowObject)) {
      return 'no legacy records';
    }

    const schema = getWorkspaceSchemaName(workspaceId);
    const countRows = async ({
      query,
      parameters = [],
    }: {
      query: string;
      parameters?: unknown[];
    }) => {
      const [{ count }]: { count: string }[] = await dataSource.query(
        query,
        parameters,
      );

      return Number(count);
    };

    const workflowRecordCount = await countRows({
      query: `SELECT COUNT(*) AS count FROM "${schema}"."workflow"`,
    });
    const workflowAutomatedTriggerRecordCount =
      hasWorkflowAutomatedTriggerObject
        ? await countRows({
            query: `SELECT COUNT(*) AS count FROM "${schema}"."workflowAutomatedTrigger"`,
          })
        : 0;
    const attachmentCount = targetWorkflowLinkObjectNames.has('attachment')
      ? await countRows({
          query: `SELECT COUNT(*) AS count FROM "${schema}"."attachment" WHERE "targetWorkflowId" IS NOT NULL`,
        })
      : 0;
    const timelineActivityCount = targetWorkflowLinkObjectNames.has(
      'timelineActivity',
    )
      ? await countRows({
          query: `SELECT COUNT(*) AS count FROM "${schema}"."timelineActivity" WHERE "targetWorkflowId" IS NOT NULL`,
        })
      : 0;
    const favoriteCount = await countRows({
      query: `SELECT COUNT(*) AS count FROM core."navigationMenuItem" WHERE "workspaceId" = $1 AND "targetObjectMetadataId" = $2`,
      parameters: [workspaceId, workflowObject.id],
    });

    return `${workflowRecordCount} workflow record(s), ${workflowAutomatedTriggerRecordCount} automated trigger record(s), ${attachmentCount} attachment link(s), ${timelineActivityCount} timeline activity link(s), ${favoriteCount} favorite(s)`;
  }

  private async runMigrationOrThrow(
    args: Omit<
      Parameters<
        WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
      >[0],
      'isSystemBuild'
    >,
  ): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        { shouldDeferActions: false, ...args, isSystemBuild: true },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        doNotTranslate(
          `Failed to drop the workspace workflow object for workspace ${args.workspaceId}`,
        ),
      );
    }
  }
}
