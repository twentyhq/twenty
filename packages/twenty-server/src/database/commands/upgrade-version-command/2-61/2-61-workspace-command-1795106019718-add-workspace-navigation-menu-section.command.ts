import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildWorkspaceNavigationMenuSectionOperations } from 'src/database/commands/upgrade-version-command/2-61/utils/build-workspace-navigation-menu-section-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.61.0', 1795106019718)
@Command({
  name: 'upgrade:2-61:add-workspace-navigation-menu-section',
  description:
    'Add the standard Workspace section and move the shared top-level sidebar items into it',
})
export class AddWorkspaceNavigationMenuSectionCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(WorkspaceMigrationValidateBuildAndRunService)
  private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  @Inject(ApplicationService)
  private readonly applicationService: ApplicationService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
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
        sectionName: STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection.name,
        movableApplicationIds: new Set([
          twentyStandardFlatApplication.id,
          workspaceCustomFlatApplication.id,
        ]),
        ownerApplication: twentyStandardFlatApplication,
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
            twentyStandardFlatApplication.universalIdentifier,
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
