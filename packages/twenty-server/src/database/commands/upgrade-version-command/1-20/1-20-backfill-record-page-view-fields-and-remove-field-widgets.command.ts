import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { PageLayoutTabLayoutMode, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Universal identifiers for the FIELD widgets to remove
const TASK_ASSIGNEE_FIELD_WIDGET_UNIVERSAL_IDENTIFIER =
  '20202020-ac05-4005-8005-ba5ca11a5513';
const COMPANY_ACCOUNT_OWNER_FIELD_WIDGET_UNIVERSAL_IDENTIFIER =
  '20202020-ac01-4001-8001-c0aba11c0113';

// Universal identifier for the company opportunities widget whose position needs updating
const COMPANY_OPPORTUNITIES_WIDGET_UNIVERSAL_IDENTIFIER =
  '20202020-ac01-4001-8001-c0aba11c0114';

@Command({
  name: 'upgrade:1-20:backfill-record-page-view-fields-and-remove-field-widgets',
  description:
    'Add missing view fields to record page FIELDS_WIDGET views and remove assignee/accountOwner FIELD widgets',
})
export class BackfillRecordPageViewFieldsAndRemoveFieldWidgetsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of record page view fields for workspace ${workspaceId}`,
    );

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

    const {
      flatViewMaps: existingFlatViewMaps,
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps,
      flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    // Find existing FIELDS_WIDGET view universal identifiers
    const existingFieldsWidgetViewUniversalIdentifiers = new Set<string>();

    for (const view of Object.values(
      existingFlatViewMaps.byUniversalIdentifier,
    )) {
      if (isDefined(view) && view.type === ViewType.FIELDS_WIDGET) {
        existingFieldsWidgetViewUniversalIdentifiers.add(
          view.universalIdentifier,
        );
      }
    }

    // Filter standard view fields that belong to existing FIELDS_WIDGET views and don't exist yet
    const viewFieldsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewField) =>
          existingFieldsWidgetViewUniversalIdentifiers.has(
            viewField.viewUniversalIdentifier,
          ) &&
          !isDefined(
            existingFlatViewFieldMaps.byUniversalIdentifier[
              viewField.universalIdentifier
            ],
          ),
      );

    // Filter standard view field groups that belong to existing FIELDS_WIDGET views and don't exist yet
    const viewFieldGroupsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewFieldGroup) =>
          existingFieldsWidgetViewUniversalIdentifiers.has(
            viewFieldGroup.viewUniversalIdentifier,
          ) &&
          !isDefined(
            existingFlatViewFieldGroupMaps.byUniversalIdentifier[
              viewFieldGroup.universalIdentifier
            ],
          ),
      );

    // Find FIELD widgets to delete
    const widgetsToDelete: FlatPageLayoutWidget[] = [];
    const widgetsToUpdate: FlatPageLayoutWidget[] = [];

    for (const widget of Object.values(
      existingFlatPageLayoutWidgetMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(widget)) {
        continue;
      }

      if (
        widget.universalIdentifier ===
          TASK_ASSIGNEE_FIELD_WIDGET_UNIVERSAL_IDENTIFIER ||
        widget.universalIdentifier ===
          COMPANY_ACCOUNT_OWNER_FIELD_WIDGET_UNIVERSAL_IDENTIFIER
      ) {
        widgetsToDelete.push(widget);
      }

      // Update opportunities widget position from FOURTH (index 3) to THIRD (index 2)
      if (
        widget.universalIdentifier ===
          COMPANY_OPPORTUNITIES_WIDGET_UNIVERSAL_IDENTIFIER &&
        widget.type === WidgetType.FIELD &&
        isDefined(widget.position) &&
        'index' in widget.position &&
        widget.position.index === 3
      ) {
        widgetsToUpdate.push({
          ...widget,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 2,
          },
        });
      }
    }

    this.logger.log(
      `Found ${viewFieldsToCreate.length} view fields to create, ${viewFieldGroupsToCreate.length} view field groups to create, ${widgetsToDelete.length} widgets to delete, ${widgetsToUpdate.length} widgets to update`,
    );

    if (
      viewFieldsToCreate.length === 0 &&
      viewFieldGroupsToCreate.length === 0 &&
      widgetsToDelete.length === 0 &&
      widgetsToUpdate.length === 0
    ) {
      this.logger.log(`Nothing to do for workspace ${workspaceId}, skipping`);

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${viewFieldsToCreate.length} view fields, ${viewFieldGroupsToCreate.length} view field groups, delete ${widgetsToDelete.length} widgets, update ${widgetsToUpdate.length} widgets for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
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
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: widgetsToDelete,
              flatEntityToUpdate: widgetsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill record page view fields:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to backfill record page view fields for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled record page view fields for workspace ${workspaceId}`,
    );
  }
}
