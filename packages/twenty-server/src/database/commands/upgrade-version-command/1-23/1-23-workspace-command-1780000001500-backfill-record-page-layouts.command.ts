import { Command } from 'nest-commander';
import { FeatureFlagKey, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { computeFlatDefaultRecordPageLayoutToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-default-record-page-layout-to-create.util';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

@RegisteredWorkspaceCommand('1.23.0', 1780000001500)
@Command({
  name: 'upgrade:1-23:backfill-record-page-layouts',
  description:
    'Delete and recreate all record page layouts from standard config, backfill custom objects, and enable IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
})
export class BackfillRecordPageLayoutsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
        `[DRY RUN] Would recreate all record page layouts and enable feature flag for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.deleteAllRecordPageLayoutEntities({
      workspaceId,
      twentyStandardFlatApplication,
    });

    await this.createStandardRecordPageLayouts({
      workspaceId,
      twentyStandardFlatApplication,
    });

    await this.createCustomObjectPageLayouts({
      workspaceId,
      twentyStandardFlatApplication,
    });

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED],
      workspaceId,
    );

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Successfully backfilled record page layouts for workspace ${workspaceId}`,
    );
  }

  private async deleteAllRecordPageLayoutEntities({
    workspaceId,
    twentyStandardFlatApplication,
  }: {
    workspaceId: string;
    twentyStandardFlatApplication: FlatApplication;
  }): Promise<void> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
    ]);

    const recordPageLayouts = Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((layout) => layout.type === PageLayoutType.RECORD_PAGE);

    const recordPageLayoutIds = new Set(
      recordPageLayouts.map((layout) => layout.id),
    );

    const tabs = Object.values(flatPageLayoutTabMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((tab) => recordPageLayoutIds.has(tab.pageLayoutId));

    const tabIds = new Set(tabs.map((tab) => tab.id));

    const widgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) => tabIds.has(widget.pageLayoutTabId));

    const fieldsWidgetViews = Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((view) => view.type === ViewType.FIELDS_WIDGET);

    const fieldsWidgetViewUniversalIdentifiers = new Set(
      fieldsWidgetViews.map((view) => view.universalIdentifier),
    );

    const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((viewField) =>
        fieldsWidgetViewUniversalIdentifiers.has(
          viewField.viewUniversalIdentifier,
        ),
      );

    const viewFieldGroups = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFieldGroup) =>
        fieldsWidgetViewUniversalIdentifiers.has(
          viewFieldGroup.viewUniversalIdentifier,
        ),
      );

    if (recordPageLayouts.length === 0 && fieldsWidgetViews.length === 0) {
      return;
    }

    this.logger.log(
      `Deleting ${recordPageLayouts.length} page layouts, ${tabs.length} tabs, ${widgets.length} widgets, ${fieldsWidgetViews.length} views, ${viewFields.length} view fields, ${viewFieldGroups.length} view field groups for workspace ${workspaceId}`,
    );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFields,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldGroups,
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: fieldsWidgetViews,
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: widgets,
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: tabs,
              flatEntityToUpdate: [],
            },
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: recordPageLayouts,
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
        `Failed to delete record page layout entities:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to delete record page layout entities for workspace ${workspaceId}`,
      );
    }
  }

  private async createStandardRecordPageLayouts({
    workspaceId,
    twentyStandardFlatApplication,
  }: {
    workspaceId: string;
    twentyStandardFlatApplication: FlatApplication;
  }): Promise<void> {
    const { allFlatEntityMaps: standardMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const existingObjectMetadataUniversalIdentifiers = new Set(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((objectMetadata) => objectMetadata.universalIdentifier),
    );

    const recordPageLayoutUniversalIdentifiers = new Set<string>();

    const pageLayouts = Object.values(
      standardMaps.flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((pageLayout) => {
        if (pageLayout.type !== PageLayoutType.RECORD_PAGE) {
          return false;
        }

        if (
          isDefined(pageLayout.objectMetadataUniversalIdentifier) &&
          !existingObjectMetadataUniversalIdentifiers.has(
            pageLayout.objectMetadataUniversalIdentifier,
          )
        ) {
          this.logger.log(
            `Skipping standard record page layout ${pageLayout.universalIdentifier} for workspace ${workspaceId}: associated object ${pageLayout.objectMetadataUniversalIdentifier} does not exist`,
          );

          return false;
        }

        recordPageLayoutUniversalIdentifiers.add(
          pageLayout.universalIdentifier,
        );

        return true;
      });

    const tabUniversalIdentifiers = new Set<string>();

    const tabs = Object.values(
      standardMaps.flatPageLayoutTabMaps.byUniversalIdentifier,
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

    const widgets = Object.values(
      standardMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) =>
        tabUniversalIdentifiers.has(widget.pageLayoutTabUniversalIdentifier),
      );

    const fieldsWidgetViewUniversalIdentifiers = new Set<string>();

    const views = Object.values(standardMaps.flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((view) => {
        if (view.type !== ViewType.FIELDS_WIDGET) {
          return false;
        }

        if (
          isDefined(view.objectMetadataUniversalIdentifier) &&
          !existingObjectMetadataUniversalIdentifiers.has(
            view.objectMetadataUniversalIdentifier,
          )
        ) {
          return false;
        }

        fieldsWidgetViewUniversalIdentifiers.add(view.universalIdentifier);

        return true;
      });

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const viewFields = Object.values(
      standardMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewField) =>
        fieldsWidgetViewUniversalIdentifiers.has(
          viewField.viewUniversalIdentifier,
        ),
      )
      .filter((viewField) =>
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[
            viewField.fieldMetadataUniversalIdentifier
          ],
        ),
      );

    const viewFieldGroups = Object.values(
      standardMaps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFieldGroup) =>
        fieldsWidgetViewUniversalIdentifiers.has(
          viewFieldGroup.viewUniversalIdentifier,
        ),
      );

    this.logger.log(
      `Creating ${pageLayouts.length} standard page layouts, ${views.length} views, ${viewFields.length} view fields for workspace ${workspaceId}`,
    );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: pageLayouts,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: tabs,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: widgets,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: views,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFields,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: viewFieldGroups,
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
        `Failed to create standard record page layouts:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to create standard record page layouts for workspace ${workspaceId}`,
      );
    }
  }

  private async createCustomObjectPageLayouts({
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

    const objectIdsWithRecordPageLayout = new Set(
      Object.values(flatPageLayoutMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (layout) =>
            layout.type === PageLayoutType.RECORD_PAGE &&
            isDefined(layout.objectMetadataId),
        )
        .map((layout) => layout.objectMetadataId),
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

    const allPageLayouts: FlatPageLayout[] = [];
    const allTabs: FlatPageLayoutTab[] = [];
    const allWidgets: FlatPageLayoutWidget[] = [];
    const allViews: (UniversalFlatView & { id: string })[] = [];
    const allViewFields: UniversalFlatViewField[] = [];

    for (const customObject of customObjectsWithoutPageLayout) {
      const fieldsView = computeFlatRecordPageFieldsViewToCreate({
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
        viewUniversalIdentifier: fieldsView.universalIdentifier,
        flatApplication: twentyStandardFlatApplication,
        labelIdentifierFieldMetadataUniversalIdentifier:
          customObject.labelIdentifierFieldMetadataUniversalIdentifier,
        excludeLabelIdentifier: true,
      });

      const { pageLayouts, pageLayoutTabs, pageLayoutWidgets } =
        computeFlatDefaultRecordPageLayoutToCreate({
          objectMetadata: customObject,
          flatApplication: twentyStandardFlatApplication,
          recordPageFieldsView: fieldsView,
          workspaceId,
        });

      allPageLayouts.push(...pageLayouts);
      allTabs.push(...pageLayoutTabs);
      allWidgets.push(...pageLayoutWidgets);
      allViews.push(fieldsView);
      allViewFields.push(...viewFields);
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: allPageLayouts,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: allTabs,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: allWidgets,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: allViews,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: allViewFields,
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
        `Failed to create custom object page layouts:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to create custom object page layouts for workspace ${workspaceId}`,
      );
    }
  }
}
