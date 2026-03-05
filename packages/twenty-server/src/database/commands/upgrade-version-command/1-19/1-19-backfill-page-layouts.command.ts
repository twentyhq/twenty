import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FeatureFlagKey, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { computeFlatDefaultRecordPageLayoutToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-default-record-page-layout-to-create.util';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

@Command({
  name: 'upgrade:1-19:backfill-page-layouts',
  description:
    'Backfill RECORD_PAGE page layouts for legacy workspaces and enable the IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED feature flag',
})
export class BackfillPageLayoutsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of page layouts for workspace ${workspaceId}`,
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
        `[DRY RUN] Would create RECORD_PAGE page layouts and enable IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        shouldIncludeRecordPageLayouts: true,
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const recordPageLayoutUniversalIdentifiers = new Set<string>();

    const pageLayoutsToCreate = Object.values(
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

    const pageLayoutTabsToCreate = Object.values(
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

    const pageLayoutWidgetsToCreate = Object.values(
      standardAllFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) =>
        tabUniversalIdentifiers.has(widget.pageLayoutTabUniversalIdentifier),
      );

    const viewUniversalIdentifiers = new Set<string>();

    const viewsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((view) => {
        if (view.type !== ViewType.FIELDS_WIDGET) {
          return false;
        }

        viewUniversalIdentifiers.add(view.universalIdentifier);

        return true;
      });

    const viewFieldsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewField) =>
        viewUniversalIdentifiers.has(viewField.viewUniversalIdentifier),
      );

    const viewFieldGroupsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFieldGroup) =>
        viewUniversalIdentifiers.has(viewFieldGroup.viewUniversalIdentifier),
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
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: viewFieldGroupsToCreate,
              flatEntityToDelete: [],
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
        `Failed to create standard page layouts:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create standard page layouts for workspace ${workspaceId}`,
      );
    }

    await this.backfillCustomObjectPageLayouts({
      workspaceId,
      workspaceCustomFlatApplication,
    });

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Successfully created page layouts and enabled IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED for workspace ${workspaceId}`,
    );
  }

  private async backfillCustomObjectPageLayouts({
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
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
        flatApplication: workspaceCustomFlatApplication,
      });

      const objectFieldMetadatas = Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((field) => field.objectMetadataId === customObject.id);

      const viewFields = computeFlatViewFieldsToCreate({
        objectFlatFieldMetadatas: objectFieldMetadatas,
        viewUniversalIdentifier: flatRecordPageFieldsView.universalIdentifier,
        flatApplication: workspaceCustomFlatApplication,
        labelIdentifierFieldMetadataUniversalIdentifier:
          customObject.labelIdentifierFieldMetadataUniversalIdentifier,
      });

      const { pageLayouts, pageLayoutTabs, pageLayoutWidgets } =
        computeFlatDefaultRecordPageLayoutToCreate({
          objectMetadata: customObject,
          flatApplication: workspaceCustomFlatApplication,
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
            workspaceCustomFlatApplication.universalIdentifier,
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
}
