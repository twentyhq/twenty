import { Inject } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildWorkspaceNavigationMenuSectionOperations } from 'src/database/commands/upgrade-version-command/2-61/utils/build-workspace-navigation-menu-section-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.61.0', 1795087915474)
@Command({
  name: 'upgrade:2-61:add-workspace-navigation-menu-section',
  description:
    'For workspaces with the customizable sidebar on, add a Workspace section and move the shared top-level sidebar items into it',
})
export class AddWorkspaceNavigationMenuSectionCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(WorkspaceMigrationValidateBuildAndRunService)
  private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  @Inject(ApplicationService)
  private readonly applicationService: ApplicationService;

  @Inject(FeatureFlagService)
  private readonly featureFlagService: FeatureFlagService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isCustomizableSidebarEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
        workspaceId,
      );

    if (!isCustomizableSidebarEnabled) {
      return;
    }

    const { flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatEntityToCreate, flatEntityToUpdate } =
      buildWorkspaceNavigationMenuSectionOperations({
        navigationMenuItems: Object.values(
          flatNavigationMenuItemMaps.byUniversalIdentifier,
        ).filter(isDefined),
        sectionId: v4(),
        sectionName: i18nLabel(
          msg({ message: `Workspace`, context: 'navigationMenuItem.name' }),
        ),
        movableApplicationIds: new Set([
          twentyStandardFlatApplication.id,
          workspaceCustomFlatApplication.id,
        ]),
        ownerApplication: workspaceCustomFlatApplication,
        workspaceId,
        now: new Date().toISOString(),
      });

    if (!isNonEmptyArray(flatEntityToCreate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the Workspace sidebar section and moving ${flatEntityToUpdate.length} item(s) into it`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
