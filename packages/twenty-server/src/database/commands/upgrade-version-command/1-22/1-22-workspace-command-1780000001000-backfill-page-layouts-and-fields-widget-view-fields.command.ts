import { Command } from 'nest-commander';
import {
  CoreObjectNameSingular,
  FeatureFlagKey,
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  ViewType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { computeFlatDefaultRecordPageLayoutToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-default-record-page-layout-to-create.util';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  GRID_POSITIONS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

const HOME_TAB_POSITION = 10;

const isActivityTargetField = (
  fieldName: string,
  objectNameSingular: string,
): boolean =>
  (objectNameSingular === CoreObjectNameSingular.Note &&
    fieldName === 'noteTargets') ||
  (objectNameSingular === CoreObjectNameSingular.Task &&
    fieldName === 'taskTargets');

const isJunctionRelationField = (field: FlatFieldMetadata): boolean => {
  const settings = field.settings as
    | { junctionTargetFieldId?: string }
    | undefined;

  return (
    isDefined(settings?.junctionTargetFieldId) &&
    typeof settings?.junctionTargetFieldId === 'string' &&
    settings.junctionTargetFieldId.length > 0
  );
};

const isRelationTargetAvailable = (
  targetObject: FlatObjectMetadata | undefined,
): boolean => {
  if (!isDefined(targetObject)) {
    return false;
  }

  if (targetObject.isRemote) {
    return false;
  }

  if (
    targetObject.isSystem &&
    targetObject.nameSingular !== CoreObjectNameSingular.WorkspaceMember
  ) {
    return false;
  }

  return true;
};

@RegisteredWorkspaceCommand('1.22.0', 1780000001000)
@Command({
  name: 'upgrade:1-22:backfill-page-layouts-and-fields-widget-view-fields',
  description:
    'Backfill RECORD_PAGE page layouts, sync FIELDS_WIDGET view fields, create FIELD widgets, and enable IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
})
export class BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of page layouts and field widgets for workspace ${workspaceId}`,
    );

    const isAlreadyEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
      workspaceId,
    );

    if (isAlreadyEnabled) {
      this.logger.log(
        `IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED already enabled for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create page layouts, sync view fields, create FIELD widgets and enable IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.backfillStandardPageLayoutsAndSyncViews({
      workspaceId,
      twentyStandardFlatApplication,
    });

    await this.backfillCustomObjectPageLayouts({
      workspaceId,
      twentyStandardFlatApplication,
    });

    await this.backfillFieldWidgets({
      workspaceId,
      twentyStandardFlatApplication,
    });

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Successfully backfilled page layouts and field widgets for workspace ${workspaceId}`,
    );
  }

  private async backfillStandardPageLayoutsAndSyncViews({
    workspaceId,
    twentyStandardFlatApplication,
  }: {
    workspaceId: string;
    twentyStandardFlatApplication: FlatApplication;
  }): Promise<void> {
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        shouldIncludeRecordPageLayouts: true,
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const recordPageLayoutUniversalIdentifiers = new Set<string>();

    const recordPageLayoutsFromStandard = Object.values(
      standardAllFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((pageLayout) => {
        if (pageLayout.type !== PageLayoutType.RECORD_PAGE) {
          return false;
        }

        recordPageLayoutUniversalIdentifiers.add(
          pageLayout.universalIdentifier,
        );

        return true;
      });

    const tabUniversalIdentifiers = new Set<string>();

    const tabsFromStandard = Object.values(
      standardAllFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((tab) => {
        if (
          !recordPageLayoutUniversalIdentifiers.has(
            tab.pageLayoutUniversalIdentifier,
          )
        ) {
          return false;
        }

        tabUniversalIdentifiers.add(tab.universalIdentifier);

        return true;
      });

    const widgetsFromStandard = Object.values(
      standardAllFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) =>
        tabUniversalIdentifiers.has(widget.pageLayoutTabUniversalIdentifier),
      );

    const {
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatPageLayoutMaps: existingFlatPageLayoutMaps,
      flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
    ]);

    // Filter out page layouts, tabs, and widgets that already exist in the workspace
    const pageLayoutsToCreate = recordPageLayoutsFromStandard.filter(
      (pageLayout) =>
        !isDefined(
          existingFlatPageLayoutMaps.byUniversalIdentifier[
            pageLayout.universalIdentifier
          ],
        ),
    );

    const pageLayoutTabsToCreate = tabsFromStandard.filter(
      (tab) =>
        !isDefined(
          existingFlatPageLayoutTabMaps.byUniversalIdentifier[
            tab.universalIdentifier
          ],
        ),
    );

    const pageLayoutWidgetsToCreate = widgetsFromStandard.filter(
      (widget) =>
        !isDefined(
          existingFlatPageLayoutWidgetMaps.byUniversalIdentifier[
            widget.universalIdentifier
          ],
        ),
    );

    // Collect all standard FIELDS_WIDGET view universal identifiers
    // This includes both new views to create AND existing views (created by 1-19)
    const allStandardFieldsWidgetViewUniversalIds = new Set<string>();

    const viewsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((view) => {
        if (view.type !== ViewType.FIELDS_WIDGET) {
          return false;
        }

        allStandardFieldsWidgetViewUniversalIds.add(view.universalIdentifier);

        if (
          isDefined(
            existingFlatViewMaps.byUniversalIdentifier[
              view.universalIdentifier
            ],
          )
        ) {
          return false;
        }

        return true;
      });

    // Delete all existing viewFields for standard FIELDS_WIDGET views and recreate from current standard.
    // This ensures positions, visibility, and groups match the current standard definition.
    const viewFieldsToDelete = Object.values(
      existingFlatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewField) =>
        allStandardFieldsWidgetViewUniversalIds.has(
          viewField.viewUniversalIdentifier,
        ),
      );

    const viewFieldsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewField) =>
        allStandardFieldsWidgetViewUniversalIds.has(
          viewField.viewUniversalIdentifier,
        ),
      )
      // Skip viewFields whose referenced fieldMetadata doesn't exist in the workspace yet
      // (e.g. fields added to the standard definition but not yet synced to this workspace)
      .filter((viewField) =>
        isDefined(
          existingFlatFieldMetadataMaps.byUniversalIdentifier[
            viewField.fieldMetadataUniversalIdentifier
          ],
        ),
      );

    // Same delete-and-recreate approach for viewFieldGroups
    const viewFieldGroupsToDelete = Object.values(
      existingFlatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFieldGroup) =>
        allStandardFieldsWidgetViewUniversalIds.has(
          viewFieldGroup.viewUniversalIdentifier,
        ),
      );

    const viewFieldGroupsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFieldGroup) =>
        allStandardFieldsWidgetViewUniversalIds.has(
          viewFieldGroup.viewUniversalIdentifier,
        ),
      );

    this.logger.log(
      `Creating ${pageLayoutsToCreate.length} page layouts, ${viewsToCreate.length} views, deleting ${viewFieldsToDelete.length} and creating ${viewFieldsToCreate.length} view fields, deleting ${viewFieldGroupsToDelete.length} and creating ${viewFieldGroupsToCreate.length} view field groups for workspace ${workspaceId}`,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: pageLayoutsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: pageLayoutTabsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: viewFieldGroupsToCreate,
              flatEntityToDelete: viewFieldGroupsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to create standard page layouts and sync view fields:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create standard page layouts and sync view fields for workspace ${workspaceId}`,
      );
    }
  }

  private async backfillCustomObjectPageLayouts({
    workspaceId,
    twentyStandardFlatApplication,
  }: {
    workspaceId: string;
    twentyStandardFlatApplication: FlatApplication;
  }): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
    ]);

    const existingPageLayouts = Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const objectIdsWithRecordPageLayout = new Set(
      existingPageLayouts
        .filter(
          (layout: FlatPageLayout) =>
            layout.type === PageLayoutType.RECORD_PAGE &&
            isDefined(layout.objectMetadataId),
        )
        .map((layout: FlatPageLayout) => layout.objectMetadataId),
    );

    const customObjectsWithoutPageLayout = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (objectMetadata) =>
          objectMetadata.isCustom &&
          !objectMetadata.isRemote &&
          !objectIdsWithRecordPageLayout.has(objectMetadata.id),
      );

    if (customObjectsWithoutPageLayout.length === 0) {
      this.logger.log(
        `No custom objects without page layouts found for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Creating page layouts for ${customObjectsWithoutPageLayout.length} custom object(s) in workspace ${workspaceId}`,
    );

    const allCustomPageLayoutsToCreate: FlatPageLayout[] = [];
    const allCustomPageLayoutTabsToCreate: FlatPageLayoutTab[] = [];
    const allCustomPageLayoutWidgetsToCreate: FlatPageLayoutWidget[] = [];
    const allCustomViewsToCreate: (UniversalFlatView & { id: string })[] = [];
    const allCustomViewFieldsToCreate: UniversalFlatViewField[] = [];

    for (const customObject of customObjectsWithoutPageLayout) {
      const flatRecordPageFieldsView = computeFlatRecordPageFieldsViewToCreate({
        objectMetadata: customObject,
        flatApplication: twentyStandardFlatApplication,
      });

      const objectFieldMetadatas = Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((field) => field.objectMetadataId === customObject.id);

      const viewFields = computeFlatViewFieldsToCreate({
        objectFlatFieldMetadatas: objectFieldMetadatas,
        viewUniversalIdentifier: flatRecordPageFieldsView.universalIdentifier,
        flatApplication: twentyStandardFlatApplication,
        labelIdentifierFieldMetadataUniversalIdentifier:
          customObject.labelIdentifierFieldMetadataUniversalIdentifier,
        excludeLabelIdentifier: true,
      });

      const { pageLayouts, pageLayoutTabs, pageLayoutWidgets } =
        computeFlatDefaultRecordPageLayoutToCreate({
          objectMetadata: customObject,
          flatApplication: twentyStandardFlatApplication,
          recordPageFieldsView: flatRecordPageFieldsView,
          workspaceId,
        });

      allCustomPageLayoutsToCreate.push(...pageLayouts);
      allCustomPageLayoutTabsToCreate.push(...pageLayoutTabs);
      allCustomPageLayoutWidgetsToCreate.push(...pageLayoutWidgets);
      allCustomViewsToCreate.push(flatRecordPageFieldsView);
      allCustomViewFieldsToCreate.push(...viewFields);
    }

    const customValidateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: allCustomPageLayoutsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: allCustomPageLayoutTabsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: allCustomPageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: allCustomViewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: allCustomViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (customValidateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to create custom object page layouts:\n${JSON.stringify(customValidateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create custom object page layouts for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created page layouts for ${customObjectsWithoutPageLayout.length} custom object(s) in workspace ${workspaceId}`,
    );
  }

  private async backfillFieldWidgets({
    workspaceId,
    twentyStandardFlatApplication,
  }: {
    workspaceId: string;
    twentyStandardFlatApplication: FlatApplication;
  }): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    // Build a set of fieldMetadataIds that already have a FIELD widget
    const existingFieldWidgetFieldIds = new Set<string>();

    for (const widget of Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(widget) &&
        widget.configuration?.configurationType ===
          WidgetConfigurationType.FIELD &&
        isDefined(widget.configuration.fieldMetadataId)
      ) {
        existingFieldWidgetFieldIds.add(widget.configuration.fieldMetadataId);
      }
    }

    // Build object ID -> objectMetadata map
    const objectById = new Map<string, FlatObjectMetadata>();

    for (const obj of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (isDefined(obj)) {
        objectById.set(obj.id, obj);
      }
    }

    // Build object ID -> RECORD_PAGE layout map
    const recordPageLayoutByObjectId = new Map<
      string,
      { id: string; universalIdentifier: string }
    >();

    for (const layout of Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(layout) &&
        layout.type === PageLayoutType.RECORD_PAGE &&
        isDefined(layout.objectMetadataId)
      ) {
        recordPageLayoutByObjectId.set(layout.objectMetadataId, {
          id: layout.id,
          universalIdentifier: layout.universalIdentifier,
        });
      }
    }

    // Build pageLayoutId -> home tab map
    const homeTabByPageLayoutId = new Map<
      string,
      {
        id: string;
        universalIdentifier: string;
        widgetCount: number;
      }
    >();

    for (const tab of Object.values(
      flatPageLayoutTabMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(tab) &&
        tab.position === HOME_TAB_POSITION &&
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ) {
        homeTabByPageLayoutId.set(tab.pageLayoutId, {
          id: tab.id,
          universalIdentifier: tab.universalIdentifier,
          widgetCount: tab.widgetIds?.length ?? 0,
        });
      }
    }

    // Group fields by objectMetadataId
    const fieldsByObjectId = new Map<string, FlatFieldMetadata[]>();

    // Map morphId -> all field IDs sharing that morphId (for dedup)
    const fieldIdsByMorphId = new Map<string, string[]>();

    for (const field of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(field) || !isDefined(field.objectMetadataId)) {
        continue;
      }

      const list = fieldsByObjectId.get(field.objectMetadataId) ?? [];

      list.push(field);
      fieldsByObjectId.set(field.objectMetadataId, list);

      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(field.morphId)
      ) {
        const morphFieldIds = fieldIdsByMorphId.get(field.morphId) ?? [];

        morphFieldIds.push(field.id);
        fieldIdsByMorphId.set(field.morphId, morphFieldIds);
      }
    }

    const now = new Date().toISOString();

    const widgetsToCreate: FlatPageLayoutWidget[] = [];
    const processedMorphIds = new Set<string>();

    for (const object of objectById.values()) {
      const pageLayout = recordPageLayoutByObjectId.get(object.id);

      if (!isDefined(pageLayout)) {
        continue;
      }

      const homeTab = homeTabByPageLayoutId.get(pageLayout.id);

      if (!isDefined(homeTab)) {
        continue;
      }

      const fields = fieldsByObjectId.get(object.id) ?? [];
      let nextWidgetIndex = homeTab.widgetCount;

      for (const field of fields) {
        if (
          field.type !== FieldMetadataType.RELATION &&
          field.type !== FieldMetadataType.MORPH_RELATION
        ) {
          continue;
        }

        if (isActivityTargetField(field.name, object.nameSingular)) {
          continue;
        }

        if (isJunctionRelationField(field)) {
          continue;
        }

        if (field.type === FieldMetadataType.RELATION) {
          const targetObject = isDefined(field.relationTargetObjectMetadataId)
            ? objectById.get(field.relationTargetObjectMetadataId)
            : undefined;

          if (!isRelationTargetAvailable(targetObject)) {
            continue;
          }
        }

        // For morph relations, skip if any sibling field (same morphId)
        // already has a widget or was already processed in this run
        if (
          field.type === FieldMetadataType.MORPH_RELATION &&
          isDefined(field.morphId)
        ) {
          if (processedMorphIds.has(field.morphId)) {
            continue;
          }

          const siblingFieldIds = fieldIdsByMorphId.get(field.morphId) ?? [];
          const alreadyHasWidget = siblingFieldIds.some((id) =>
            existingFieldWidgetFieldIds.has(id),
          );

          if (alreadyHasWidget) {
            continue;
          }

          processedMorphIds.add(field.morphId);
        }

        if (existingFieldWidgetFieldIds.has(field.id)) {
          continue;
        }

        const widget: FlatPageLayoutWidget = {
          id: v4(),
          universalIdentifier: v4(),
          applicationId: twentyStandardFlatApplication.id,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          pageLayoutTabId: homeTab.id,
          pageLayoutTabUniversalIdentifier: homeTab.universalIdentifier,
          title: field.label,
          type: WidgetType.FIELD,
          gridPosition: { ...GRID_POSITIONS.FULL_WIDTH },
          position: {
            ...VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
            index: nextWidgetIndex,
          },
          configuration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: field.id,
            fieldDisplayMode: FieldDisplayMode.CARD,
          },
          universalConfiguration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: field.universalIdentifier,
            fieldDisplayMode: FieldDisplayMode.CARD,
          },
          objectMetadataId: object.id,
          objectMetadataUniversalIdentifier: object.universalIdentifier,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          conditionalDisplay: null,
          overrides: null,
        };

        widgetsToCreate.push(widget);
        existingFieldWidgetFieldIds.add(field.id);
        nextWidgetIndex++;
      }
    }

    if (widgetsToCreate.length === 0) {
      this.logger.log(
        `All FIELD widgets already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `Found ${widgetsToCreate.length} FIELD widget(s) to create for workspace ${workspaceId}`,
    );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: widgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to create FIELD widgets:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to create FIELD widgets for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created ${widgetsToCreate.length} FIELD widget(s) for workspace ${workspaceId}`,
    );
  }
}
