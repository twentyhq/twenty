import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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

    const { twentyStandardFlatApplication } =
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
        `Failed to create page layouts:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create page layouts for workspace ${workspaceId}`,
      );
    }

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Successfully created page layouts and enabled IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED for workspace ${workspaceId}`,
    );
  }
}
