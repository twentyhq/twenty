import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';
import { v4, v5 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { addPayloadCheckConstraintToCommandMenuItem } from 'src/database/typeorm/core/migrations/utils/1775129635528-add-payload-to-command-menu-item.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  buildNavigationFlatCommandMenuItem,
  NAVIGATION_COMMAND_UUID_NAMESPACE,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { seedCompareObjectMetadataForNavigationPosition } from 'src/engine/metadata-modules/flat-command-menu-item/utils/seed-compare-object-metadata-for-navigation-position.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const GO_TO_ENGINE_KEYS = [
  'GO_TO_PEOPLE',
  'GO_TO_COMPANIES',
  'GO_TO_DASHBOARDS',
  'GO_TO_OPPORTUNITIES',
  'GO_TO_SETTINGS',
  'GO_TO_TASKS',
  'GO_TO_NOTES',
  'GO_TO_WORKFLOWS',
  'GO_TO_RUNS',
];

const SETTINGS_NAVIGATION_ITEM_KEYS = [
  'goToSettings',
  'goToSettingsExperience',
  'goToSettingsAccounts',
  'goToSettingsAccountsEmails',
  'goToSettingsAccountsCalendars',
  'goToSettingsGeneral',
  'goToSettingsObjects',
  'goToSettingsMembers',
  'goToSettingsRoles',
  'goToSettingsDomains',
  'goToSettingsBilling',
  'goToSettingsApiWebhooks',
  'goToSettingsApplications',
  'goToSettingsAI',
  'goToSettingsSecurity',
  'goToSettingsAdminPanel',
  'goToSettingsUpdates',
] as const satisfies ReadonlyArray<keyof typeof STANDARD_COMMAND_MENU_ITEMS>;

@RegisteredWorkspaceCommand('1.21.0', 1775500013000)
@Command({
  name: 'upgrade:1-21:refactor-navigation-commands',
  description:
    'Replace GO_TO_* command menu items with unified NAVIGATION engine key and payload',
})
export class RefactorNavigationCommandsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async run(
    passedParams: string[],
    options: WorkspaceCommandOptions,
  ): Promise<void> {
    await super.run(passedParams, options);

    if (options.workspaceId && options.workspaceId.size > 0) {
      this.logger.log(
        'Skipping CHECK constraint application: command was not launched for all workspaces',
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        '[DRY RUN] Would apply CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE',
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await addPayloadCheckConstraintToCommandMenuItem(queryRunner);
      this.logger.log(
        'Successfully applied CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE',
      );
    } finally {
      await queryRunner.release();
    }
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Refactoring navigation commands for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const allCommandMenuItems = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const standardAppCommandMenuItems = allCommandMenuItems.filter(
      (item) => item.applicationId === twentyStandardFlatApplication.id,
    );

    const goToItemsToDelete = standardAppCommandMenuItems.filter((item) =>
      GO_TO_ENGINE_KEYS.includes(item.engineComponentKey),
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would delete' : 'Deleting'} ${goToItemsToDelete.length} old GO_TO_* command(s) for workspace ${workspaceId}`,
    );

    const existingNavigationUniversalIdentifiers = new Set(
      allCommandMenuItems
        .filter(
          (item) => item.engineComponentKey === EngineComponentKey.NAVIGATION,
        )
        .map((item) => item.universalIdentifier),
    );

    const activeObjects = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((objectMetadata) => objectMetadata.isActive)
      .sort(seedCompareObjectMetadataForNavigationPosition);

    this.logger.log(
      `Found ${activeObjects.length} active object(s) for workspace ${workspaceId}`,
    );

    const nonGoToItems = allCommandMenuItems.filter(
      (item) => !GO_TO_ENGINE_KEYS.includes(item.engineComponentKey),
    );

    let nextPosition =
      nonGoToItems.reduce((max, item) => Math.max(max, item.position), -1) + 1;

    const now = new Date().toISOString();
    const flatCommandMenuItemsToCreate: FlatCommandMenuItem[] = [];

    for (const objectMetadata of activeObjects) {
      const universalIdentifier = v5(
        objectMetadata.universalIdentifier,
        NAVIGATION_COMMAND_UUID_NAMESPACE,
      );

      if (existingNavigationUniversalIdentifiers.has(universalIdentifier)) {
        continue;
      }

      flatCommandMenuItemsToCreate.push(
        buildNavigationFlatCommandMenuItem({
          objectMetadata,
          commandMenuItemId: v4(),
          applicationId: twentyStandardFlatApplication.id,
          workspaceId,
          position: nextPosition++,
          now,
        }),
      );
    }

    for (const settingsItemKey of SETTINGS_NAVIGATION_ITEM_KEYS) {
      const commandMenuItem = STANDARD_COMMAND_MENU_ITEMS[settingsItemKey];

      if (
        existingNavigationUniversalIdentifiers.has(
          commandMenuItem.universalIdentifier,
        )
      ) {
        continue;
      }

      flatCommandMenuItemsToCreate.push({
        id: v4(),
        universalIdentifier: commandMenuItem.universalIdentifier,
        applicationId: twentyStandardFlatApplication.id,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        workspaceId,
        label: commandMenuItem.label,
        shortLabel: commandMenuItem.shortLabel,
        icon: commandMenuItem.icon,
        position: nextPosition++,
        isPinned: commandMenuItem.isPinned,
        availabilityType: commandMenuItem.availabilityType,
        conditionalAvailabilityExpression:
          commandMenuItem.conditionalAvailabilityExpression ?? null,
        frontComponentId: null,
        frontComponentUniversalIdentifier: null,
        engineComponentKey: EngineComponentKey.NAVIGATION,
        payload: { ...commandMenuItem.payload },
        hotKeys: commandMenuItem.hotKeys ? [...commandMenuItem.hotKeys] : null,
        workflowVersionId: null,
        availabilityObjectMetadataId: null,
        availabilityObjectMetadataUniversalIdentifier: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (
      goToItemsToDelete.length === 0 &&
      flatCommandMenuItemsToCreate.length === 0
    ) {
      this.logger.log(
        `All NAVIGATION commands already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would create' : 'Creating'} ${flatCommandMenuItemsToCreate.length} NAVIGATION command(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: flatCommandMenuItemsToCreate,
              flatEntityToDelete: goToItemsToDelete,
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
        `Failed to refactor navigation commands:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to refactor navigation commands for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully refactored navigation commands for workspace ${workspaceId}`,
    );
  }
}
