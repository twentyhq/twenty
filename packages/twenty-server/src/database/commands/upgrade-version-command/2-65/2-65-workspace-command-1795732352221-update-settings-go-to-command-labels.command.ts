import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SETTINGS_GO_TO_COMMAND_LABEL_RENAMES = [
  {
    universalIdentifier: 'bceb0328-c018-48ba-80d8-a1a97dc0a8ba',
    formerLabel: 'Go to Experience Settings',
    currentLabel: 'Go to Experience',
  },
  {
    universalIdentifier: 'ad68e516-96ea-455a-a838-c59788e88c23',
    formerLabel: 'Go to General Settings',
    currentLabel: 'Go to General',
  },
  {
    universalIdentifier: '9302bfeb-f6cd-4858-ab5b-5f70f4d358c4',
    formerLabel: 'Go to Data Model Settings',
    currentLabel: 'Go to Data Model',
  },
  {
    universalIdentifier: 'fb4d9f1b-5b13-49d9-8353-80041719d411',
    formerLabel: 'Go to Members Settings',
    currentLabel: 'Go to Members',
  },
  {
    universalIdentifier: '4050f307-c592-4c9f-ad91-89cde330fbf7',
    formerLabel: 'Go to Roles Settings',
    currentLabel: 'Go to Roles',
  },
  {
    universalIdentifier: '2d071684-fb5e-4222-b560-4c7ab2597fb4',
    formerLabel: 'Go to Domains Settings',
    currentLabel: 'Go to Domains',
  },
  {
    universalIdentifier: 'f46a0fb9-14e9-4d48-801d-c33bdd543f74',
    formerLabel: 'Go to Billing Settings',
    currentLabel: 'Go to Billing',
  },
  {
    universalIdentifier: 'ed2c2fde-1e7a-4a42-ba63-221eaa7c9759',
    formerLabel: 'Go to Developers Settings',
    currentLabel: 'Go to Developers',
  },
  {
    universalIdentifier: '44db6d7a-79ac-485e-b3da-da8776bd7777',
    formerLabel: 'Go to Apps Settings',
    currentLabel: 'Go to Apps',
  },
  {
    universalIdentifier: '3eaec228-809d-452d-b5ef-7b777398c538',
    formerLabel: 'Go to AI Settings',
    currentLabel: 'Go to AI',
  },
  {
    universalIdentifier: '358e69b2-0789-44e2-add7-bdef68413be8',
    formerLabel: 'Go to Security Settings',
    currentLabel: 'Go to Security',
  },
  {
    universalIdentifier: 'dd22798b-fca6-42af-ba3b-0d48f263afbd',
    formerLabel: 'Go to Admin Panel Settings',
    currentLabel: 'Go to Admin Panel',
  },
  {
    universalIdentifier: '5d1ba354-0090-4a42-9a43-601461b26068',
    formerLabel: 'Go to Community Settings',
    currentLabel: 'Go to Community',
  },
];

const buildSettingsGoToCommandLabelUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  SETTINGS_GO_TO_COMMAND_LABEL_RENAMES.flatMap(
    ({ universalIdentifier, formerLabel, currentLabel }) => {
      const existingCommandMenuItem =
        flatCommandMenuItemByUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(existingCommandMenuItem) ||
        existingCommandMenuItem.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
        existingCommandMenuItem.label !== formerLabel
      ) {
        return [];
      }

      return [
        { ...existingCommandMenuItem, label: currentLabel, updatedAt: now },
      ];
    },
  );

@RegisteredWorkspaceCommand('2.65.0', 1795732352221)
@Command({
  name: 'upgrade:2-65:update-settings-go-to-command-labels',
  description:
    'Drop the Settings suffix from the standard settings Go to command labels in existing workspaces',
})
export class UpdateSettingsGoToCommandLabelsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate = buildSettingsGoToCommandLabelUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
    });

    if (!isNonEmptyArray(commandMenuItemsToUpdate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${commandMenuItemsToUpdate.length} settings Go to command label(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }
  }
}
