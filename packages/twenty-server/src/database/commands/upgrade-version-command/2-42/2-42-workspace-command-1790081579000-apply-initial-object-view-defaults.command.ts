import { Command } from 'nest-commander';

import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  INITIAL_OBJECT_VIEW_DEFAULT,
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

@RegisteredWorkspaceCommand('2.42.0', 1790081579000)
@Command({
  name: 'upgrade:2-42:apply-initial-object-view-defaults',
  description:
    'Apply the per-object initial view type and position to the views the 2.41 backfill already seeded, leaving any view already at its target or changed since untouched.',
})
export class ApplyInitialObjectViewDefaultsCommand extends ProvisionedWorkspaceCommandRunner {
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

        const targetIcon = VIEW_TYPE_DEFAULT_ICONS[initialObjectViewDefault.type];

        const isAlreadyAtTarget =
          flatView.type === initialObjectViewDefault.type &&
          flatView.position === initialObjectViewDefault.position &&
          flatView.icon === targetIcon;

        const holdsSeedDefaults =
          flatView.type === INITIAL_OBJECT_VIEW_DEFAULT.type &&
          flatView.position === INITIAL_OBJECT_VIEW_DEFAULT.position &&
          flatView.icon === VIEW_TYPE_DEFAULT_ICONS[INITIAL_OBJECT_VIEW_DEFAULT.type];

        if (isAlreadyAtTarget || !holdsSeedDefaults) {
          return accumulator;
        }

        accumulator.push({
          ...flatView,
          type: initialObjectViewDefault.type,
          position: initialObjectViewDefault.position,
          icon: targetIcon,
        });

        return accumulator;
      },
      [],
    );

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would update ${viewsToUpdate.length} initial object view(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (viewsToUpdate.length === 0) {
      this.logger.log(
        `No initial object view to update for workspace ${workspaceId}`,
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
        `Multiple validation errors occurred while applying initial object view defaults for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Updated ${viewsToUpdate.length} initial object view(s) for workspace ${workspaceId}`,
    );
  }
}
