import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.emailBlockSettings.universalIdentifier;

const EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.emailPageStyle.universalIdentifier;

type CommandMenuItemPresentation = Pick<
  FlatCommandMenuItem,
  'label' | 'shortLabel' | 'icon'
>;

const BLOCK_SETTINGS_PRESENTATION: CommandMenuItemPresentation = {
  label: 'Block Settings',
  shortLabel: 'Design',
  icon: 'IconAdjustments',
};

const ADD_BLOCK_PRESENTATION: CommandMenuItemPresentation = {
  label: 'Add Block',
  shortLabel: 'Add Block',
  icon: 'IconPlus',
};

const buildEmailBlockSettingsPresentationUpdates = ({
  emailBlockSettings,
  previousPresentation,
  nextPresentation,
  now,
}: {
  emailBlockSettings: FlatCommandMenuItem | undefined;
  previousPresentation: CommandMenuItemPresentation;
  nextPresentation: CommandMenuItemPresentation;
  now: string;
}): FlatCommandMenuItem[] => {
  if (!isDefined(emailBlockSettings)) {
    return [];
  }

  const shouldUpdateLabel =
    emailBlockSettings.label === previousPresentation.label;
  const shouldUpdateShortLabel =
    emailBlockSettings.shortLabel === previousPresentation.shortLabel;
  const shouldUpdateIcon =
    emailBlockSettings.icon === previousPresentation.icon;

  if (!shouldUpdateLabel && !shouldUpdateShortLabel && !shouldUpdateIcon) {
    return [];
  }

  return [
    {
      ...emailBlockSettings,
      label: shouldUpdateLabel
        ? nextPresentation.label
        : emailBlockSettings.label,
      shortLabel: shouldUpdateShortLabel
        ? nextPresentation.shortLabel
        : emailBlockSettings.shortLabel,
      icon: shouldUpdateIcon ? nextPresentation.icon : emailBlockSettings.icon,
      updatedAt: now,
    },
  ];
};

@RegisteredWorkspaceCommand('2.48.0', 1791972314457)
@Command({
  name: 'upgrade:2-48:split-email-block-settings-command-menu-item',
  description:
    'Rename the campaign Block Settings command to Add Block and add the pinned Email Style command next to it',
})
export class SplitEmailBlockSettingsCommandMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'down');
  }

  private async apply(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);
    const now = new Date().toISOString();

    const commandMenuItemsToCreate =
      direction === 'up'
        ? buildMissingStandardCommandMenuItemsToCreate({
            commandMenuItemNames: ['emailPageStyle'],
            flatCommandMenuItemByUniversalIdentifier:
              flatCommandMenuItemMaps.byUniversalIdentifier,
            flatObjectMetadataMaps,
            workspaceId,
            now,
          })
        : [];
    const commandMenuItemsToDelete =
      direction === 'down'
        ? [
            flatCommandMenuItemMaps.byUniversalIdentifier[
              EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER
            ],
          ].filter(isDefined)
        : [];
    const commandMenuItemsToUpdate = buildEmailBlockSettingsPresentationUpdates(
      {
        emailBlockSettings:
          flatCommandMenuItemMaps.byUniversalIdentifier[
            EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER
          ],
        previousPresentation:
          direction === 'up'
            ? BLOCK_SETTINGS_PRESENTATION
            : ADD_BLOCK_PRESENTATION,
        nextPresentation:
          direction === 'up'
            ? ADD_BLOCK_PRESENTATION
            : BLOCK_SETTINGS_PRESENTATION,
        now,
      },
    );

    if (
      commandMenuItemsToCreate.length +
        commandMenuItemsToDelete.length +
        commandMenuItemsToUpdate.length ===
      0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): creating ${commandMenuItemsToCreate.length}, deleting ${commandMenuItemsToDelete.length} and updating ${commandMenuItemsToUpdate.length} campaign design command menu item(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: commandMenuItemsToDelete,
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
