import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Command({
  name: 'upgrade:1-19:backfill-missing-standard-views',
  description:
    'Backfill missing standard views and their child entities (fields, groups, filters, field groups) for workspaces',
})
export class BackfillMissingStandardViewsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of missing standard views for workspace ${workspaceId}`,
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

    const { flatViewMaps: existingFlatViewMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
      ]);

    const missingViewUniversalIdentifiers = new Set<string>();

    const viewsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((view) => {
        const alreadyExists = isDefined(
          existingFlatViewMaps.byUniversalIdentifier[view.universalIdentifier],
        );

        if (alreadyExists) {
          return false;
        }

        missingViewUniversalIdentifiers.add(view.universalIdentifier);

        return true;
      });

    if (viewsToCreate.length === 0) {
      this.logger.log(
        `No missing standard views for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `Found ${viewsToCreate.length} missing standard view(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${viewsToCreate.length} view(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const viewFieldsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewField) =>
        missingViewUniversalIdentifiers.has(viewField.viewUniversalIdentifier),
      );

    const viewGroupsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewGroup) =>
        missingViewUniversalIdentifiers.has(viewGroup.viewUniversalIdentifier),
      );

    const viewFiltersToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFilterMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFilter) =>
        missingViewUniversalIdentifiers.has(viewFilter.viewUniversalIdentifier),
      );

    const viewFieldGroupsToCreate = Object.values(
      standardAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFieldGroup) =>
        missingViewUniversalIdentifiers.has(
          viewFieldGroup.viewUniversalIdentifier,
        ),
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
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
            viewGroup: {
              flatEntityToCreate: viewGroupsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFilter: {
              flatEntityToCreate: viewFiltersToCreate,
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
      this.logger.warn(
        `Failed to backfill missing standard views for workspace ${workspaceId}, skipping:\n${JSON.stringify(validateAndBuildResult)}`,
      );

      return;
    }

    this.logger.log(
      `Successfully backfilled ${viewsToCreate.length} standard view(s) for workspace ${workspaceId}`,
    );
  }
}
