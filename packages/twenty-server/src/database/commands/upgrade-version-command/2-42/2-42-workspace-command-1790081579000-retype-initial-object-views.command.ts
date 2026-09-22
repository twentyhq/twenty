import { Command } from 'nest-commander';

import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';
import { INITIAL_OBJECT_VIEW_POSITION } from 'src/engine/metadata-modules/view/constants/initial-object-view-position.constant';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

@RegisteredWorkspaceCommand('2.42.0', 1790081579000)
@Command({
  name: 'upgrade:2-42:retype-initial-object-views',
  description:
    'Apply the per-object initial view defaults to the views the 2.41 backfill already seeded, leaving any view whose type, position or icon was changed since untouched.',
})
export class RetypeInitialObjectViewsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps'],
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const viewsToUpdate = Object.entries(
      INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER,
    ).reduce<UniversalFlatView[]>(
      (accumulator, [objectUniversalIdentifier, initialObjectViewDefault]) => {
        if (!isDefined(initialObjectViewDefault)) {
          return accumulator;
        }

        const flatView =
          flatViewMaps.byUniversalIdentifier[
            getInitialObjectViewUniversalIdentifier({
              viewApplicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              objectUniversalIdentifier,
            })
          ];

        if (!isDefined(flatView) || isDefined(flatView.deletedAt)) {
          return accumulator;
        }

        const isUntouchedSince2_41 =
          flatView.type === ViewType.TABLE &&
          flatView.position === INITIAL_OBJECT_VIEW_POSITION &&
          flatView.icon === VIEW_TYPE_DEFAULT_ICONS[ViewType.TABLE];

        if (!isUntouchedSince2_41) {
          return accumulator;
        }

        accumulator.push({
          ...flatView,
          type: initialObjectViewDefault.type,
          position: initialObjectViewDefault.position,
          icon: VIEW_TYPE_DEFAULT_ICONS[initialObjectViewDefault.type],
        });

        return accumulator;
      },
      [],
    );

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would retype ${viewsToUpdate.length} initial object view(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (viewsToUpdate.length === 0) {
      this.logger.log(
        `No initial object view to retype for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: viewsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Multiple validation errors occurred while retyping initial object views for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Retyped ${viewsToUpdate.length} initial object view(s) for workspace ${workspaceId}`,
    );
  }
}
