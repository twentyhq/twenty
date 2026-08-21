import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type DisplayFields = Pick<FlatCommandMenuItem, 'label' | 'shortLabel' | 'icon'>;

const DISPLAY_FIELDS = ['label', 'shortLabel', 'icon'] as const;

const pickDisplayFields = (item: DisplayFields): DisplayFields => ({
  label: item.label,
  shortLabel: item.shortLabel,
  icon: item.icon,
});

// NAVIGATION items are minted per object by the side-effect engine, so they
// are not in the standard application definition and their expected shape
// comes from the builder's constants instead.
const NAVIGATION_DISPLAY_FIELDS: DisplayFields = {
  label: NAVIGATION_INTERPOLATED_LABEL,
  shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
  icon: NAVIGATION_INTERPOLATED_ICON,
};

// Display fields are workspace-independent, so they are read off the standard
// definition directly instead of minting the whole standard application per
// workspace.
const STANDARD_DISPLAY_FIELDS_BY_UNIVERSAL_IDENTIFIER: Record<
  string,
  DisplayFields
> = Object.fromEntries(
  Object.values(STANDARD_COMMAND_MENU_ITEMS).map((item) => [
    item.universalIdentifier,
    pickDisplayFields(item),
  ]),
);

@RegisteredWorkspaceCommand('2.33.0', 1787127900000)
@Command({
  name: 'upgrade:2-33:migrate-command-menu-item-labels-to-placeholders',
  description:
    'Rewrite engine-owned command menu item labels to the source messages that carry named placeholders, replacing the template expressions they were stored as',
})
export class MigrateCommandMenuItemLabelsToPlaceholdersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const now = new Date().toISOString();

    const itemsToUpdate = Object.values(flatCommandMenuItemMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((existingItem) => {
        const expectedDisplayFields =
          existingItem.engineComponentKey === EngineComponentKey.NAVIGATION
            ? NAVIGATION_DISPLAY_FIELDS
            : STANDARD_DISPLAY_FIELDS_BY_UNIVERSAL_IDENTIFIER[
                existingItem.universalIdentifier
              ];

        if (
          !isDefined(expectedDisplayFields) ||
          DISPLAY_FIELDS.every(
            (field) => existingItem[field] === expectedDisplayFields[field],
          )
        ) {
          return undefined;
        }

        return {
          ...existingItem,
          ...expectedDisplayFields,
          updatedAt: now,
        };
      })
      .filter(isDefined);

    if (itemsToUpdate.length === 0) {
      this.logger.log(
        `Command menu item labels already use placeholders for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would update' : 'Updating'} ${itemsToUpdate.length} command menu item label(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: itemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to migrate command menu item labels:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to migrate command menu item labels for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully updated ${itemsToUpdate.length} command menu item label(s) for workspace ${workspaceId}`,
    );
  }
}
