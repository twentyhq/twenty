import { Command } from 'nest-commander';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  LEGACY_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_ID_INDEX_UNIVERSAL_IDENTIFIERS,
  LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-58/constants/legacy-workspace-workflow-universal-identifiers.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LEGACY_WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION = `
  "navigationMenuItem"."workspaceId" = $1
  AND (
    ("navigationMenuItem"."type" = 'OBJECT' AND "navigationMenuItem"."targetObjectMetadataId" = $2)
    OR (
      "navigationMenuItem"."type" = 'VIEW'
      AND "navigationMenuItem"."viewId" IN (
        SELECT "view".id FROM core."view" "view" WHERE "view"."workspaceId" = $1 AND "view"."objectMetadataId" = $2
      )
    )
  )`;

const WORKFLOWS_NATIVE_PAGE_ALREADY_VISIBLE_CONDITION = `
  EXISTS (
    SELECT 1 FROM core."navigationMenuItem" "nativePageItem"
    WHERE "nativePageItem"."workspaceId" = $1
      AND "nativePageItem"."type" = 'NATIVE_PAGE'
      AND "nativePageItem"."nativePageKey" = 'workflows'
      AND (
        "nativePageItem"."userWorkspaceId" IS NULL
        OR "nativePageItem"."userWorkspaceId" = "navigationMenuItem"."userWorkspaceId"
      )
  )`;

const DUPLICATE_LEGACY_WORKFLOW_NAVIGATION_MENU_ITEM_IDS_QUERY = `
  WITH ranked AS (
    SELECT
      "navigationMenuItem".id,
      "navigationMenuItem"."userWorkspaceId",
      ROW_NUMBER() OVER (
        ORDER BY
          "navigationMenuItem"."userWorkspaceId" IS NULL DESC,
          "navigationMenuItem"."createdAt",
          "navigationMenuItem".id
      ) AS rank
    FROM core."navigationMenuItem" "navigationMenuItem"
    WHERE ${LEGACY_WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}
  )
  SELECT duplicate.id
  FROM ranked duplicate
  WHERE EXISTS (
    SELECT 1
    FROM ranked kept
    WHERE kept.rank < duplicate.rank
      AND (
        kept."userWorkspaceId" IS NULL
        OR kept."userWorkspaceId" = duplicate."userWorkspaceId"
      )
  )`;

@RegisteredWorkspaceCommand('2.58.0', 1794298481339)
@Command({
  name: 'upgrade:2-58:drop-workspace-workflow-object',
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
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatPageLayoutWidgetMaps',
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
    const legacyWorkflowObject = objectsToDelete.find(
      ({ universalIdentifier }) =>
        universalIdentifier === LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
    );

    const fieldsToDelete = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) =>
          !deletedObjectIds.has(field.objectMetadataId) &&
          (LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS.includes(
            field.universalIdentifier,
          ) ||
            (isDefined(field.relationTargetObjectMetadataId) &&
              deletedObjectIds.has(field.relationTargetObjectMetadataId))),
      );
    const deletedFieldIds = new Set(fieldsToDelete.map(({ id }) => id));

    const indexesToDelete = Object.values(flatIndexMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (index) =>
          !deletedObjectIds.has(index.objectMetadataId) &&
          (LEGACY_WORKFLOW_ID_INDEX_UNIVERSAL_IDENTIFIERS.includes(
            index.universalIdentifier,
          ) ||
            index.flatIndexFieldMetadatas.some(({ fieldMetadataId }) =>
              deletedFieldIds.has(fieldMetadataId),
            )),
      );

    // Field, chart and filter configurations hold field ids under many keys, out of reach of foreign keys.
    const pageLayoutWidgetsToDelete = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) => {
        if (!isDefined(widget.configuration)) {
          return false;
        }

        const serializedConfiguration = JSON.stringify(widget.configuration);

        return [...deletedFieldIds].some((fieldId) =>
          serializedConfiguration.includes(fieldId),
        );
      });

    const hasDeletions =
      objectsToDelete.length +
        fieldsToDelete.length +
        indexesToDelete.length +
        pageLayoutWidgetsToDelete.length >
      0;
    if (!hasDeletions) {
      return;
    }

    const legacyDataSummary = await this.summarizeLegacyData({
      workspaceId,
      dataSource,
      workflowObject: legacyWorkflowObject,
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

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop ${plan} for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const applicationUniversalIdentifier =
      twentyStandardFlatApplication.universalIdentifier;

    if (isDefined(legacyWorkflowObject)) {
      await this.moveNavigationMenuItemsToWorkflowsNativePage({
        workspaceId,
        dataSource,
        legacyWorkflowObjectId: legacyWorkflowObject.id,
      });
    }

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

    this.logger.log(`Dropped ${plan} for workspace ${workspaceId}`);
  }

  // Items added since the 2.56 conversion would otherwise cascade away with the object.
  private async moveNavigationMenuItemsToWorkflowsNativePage({
    workspaceId,
    dataSource,
    legacyWorkflowObjectId,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    legacyWorkflowObjectId: string;
  }): Promise<void> {
    const parameters = [workspaceId, legacyWorkflowObjectId];

    const [, alreadyVisibleCount]: [unknown[], number] = await dataSource.query(
      `DELETE FROM core."navigationMenuItem" "navigationMenuItem"
       WHERE ${LEGACY_WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}
         AND ${WORKFLOWS_NATIVE_PAGE_ALREADY_VISIBLE_CONDITION}`,
      parameters,
    );

    const [, duplicateCount]: [unknown[], number] = await dataSource.query(
      `DELETE FROM core."navigationMenuItem"
       WHERE id IN (${DUPLICATE_LEGACY_WORKFLOW_NAVIGATION_MENU_ITEM_IDS_QUERY})`,
      parameters,
    );

    const [, convertedCount]: [unknown[], number] = await dataSource.query(
      `UPDATE core."navigationMenuItem" "navigationMenuItem"
       SET "type" = 'NATIVE_PAGE',
           "nativePageKey" = 'workflows',
           "targetObjectMetadataId" = NULL,
           "viewId" = NULL,
           "updatedAt" = NOW()
       WHERE ${LEGACY_WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}`,
      parameters,
    );

    if (alreadyVisibleCount + duplicateCount + convertedCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);
    }
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
    const legacyWorkflowWithoutCoreCount = await countRows({
      query: `SELECT COUNT(*) AS count FROM "${schema}"."workflow" legacy WHERE NOT EXISTS (SELECT 1 FROM core."workflow" cw WHERE cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = legacy.id)`,
      parameters: [workspaceId],
    });
    const sidebarItemCount = await countRows({
      query: `SELECT COUNT(*) AS count FROM core."navigationMenuItem" "navigationMenuItem" WHERE ${LEGACY_WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}`,
      parameters: [workspaceId, workflowObject.id],
    });
    const recordFavoriteCount = await countRows({
      query: `SELECT COUNT(*) AS count FROM core."navigationMenuItem" WHERE "workspaceId" = $1 AND "type" = 'RECORD' AND "targetObjectMetadataId" = $2`,
      parameters: [workspaceId, workflowObject.id],
    });

    return `${workflowRecordCount} workflow record(s) (${legacyWorkflowWithoutCoreCount} without a core workflow), ${workflowAutomatedTriggerRecordCount} automated trigger record(s), ${attachmentCount} attachment link(s), ${timelineActivityCount} timeline activity link(s), ${recordFavoriteCount} record favorite(s); ${sidebarItemCount} sidebar item(s) moved to the Workflows page`;
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
