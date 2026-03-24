import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, type QueryRunner, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Command({
  name: 'upgrade:1-20:backfill-command-menu-items',
  description:
    'Backfill missing standard and workflow command menu items for existing workspaces and enable IS_COMMAND_MENU_ITEM_ENABLED feature flag',
})
export class BackfillCommandMenuItemsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of command menu items for workspace ${workspaceId}`,
    );

    const isFeatureFlagAlreadyEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
        workspaceId,
      );

    if (isFeatureFlagAlreadyEnabled) {
      this.logger.log(
        `IS_COMMAND_MENU_ITEM_ENABLED already enabled for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.backfillStandardCommandMenuItems(
        workspaceId,
        isDryRun,
        queryRunner,
      );

      await this.backfillWorkflowCommandMenuItems(
        workspaceId,
        isDryRun,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back backfill of command menu items for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }

    if (!isDryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED],
        workspaceId,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed backfill of command menu items for workspace ${workspaceId}`,
    );
  }

  private async backfillStandardCommandMenuItems(
    workspaceId: string,
    isDryRun: boolean,
    queryRunner: QueryRunner,
  ): Promise<void> {
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

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToCreate = Object.values(
      standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (commandMenuItem) =>
          !isDefined(
            existingFlatCommandMenuItemMaps.byUniversalIdentifier[
              commandMenuItem.universalIdentifier
            ],
          ),
      );

    if (commandMenuItemsToCreate.length === 0) {
      this.logger.log(
        `No missing standard command menu items for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${commandMenuItemsToCreate.length} missing standard command menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${commandMenuItemsToCreate.length} standard command menu item(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          queryRunner,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill missing standard command menu items:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill missing standard command menu items for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled ${commandMenuItemsToCreate.length} standard command menu item(s) for workspace ${workspaceId}`,
    );
  }

  private async backfillWorkflowCommandMenuItems(
    workspaceId: string,
    isDryRun: boolean,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.twentyORMGlobalManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        await this.twentyORMGlobalManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const activeWorkflowVersions = await workflowVersionRepository.find({
        where: { status: WorkflowVersionStatus.ACTIVE },
      });

      const manualTriggerVersions = activeWorkflowVersions.filter(
        (version) =>
          isDefined(version.trigger) &&
          version.trigger.type === WorkflowTriggerType.MANUAL,
      );

      if (manualTriggerVersions.length === 0) {
        this.logger.log(
          `No active workflow versions with manual triggers for workspace ${workspaceId}`,
        );

        return;
      }

      const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatCommandMenuItemMaps',
        ]);

      const existingWorkflowVersionIds = new Set(
        Object.values(existingFlatCommandMenuItemMaps.byUniversalIdentifier)
          .filter(isDefined)
          .map((item) => item.workflowVersionId)
          .filter(isDefined),
      );

      const workflowRepository =
        await this.twentyORMGlobalManager.getRepository<WorkflowWorkspaceEntity>(
          workspaceId,
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        );

      const flatCommandMenuItemsToCreate: FlatCommandMenuItem[] = [];

      for (const workflowVersion of manualTriggerVersions) {
        if (existingWorkflowVersionIds.has(workflowVersion.id)) {
          continue;
        }

        const workflow = await workflowRepository.findOne({
          where: { id: workflowVersion.workflowId },
        });

        const label =
          workflow && isNonEmptyString(workflow.name)
            ? workflow.name
            : 'Manual Trigger';

        const trigger = workflowVersion.trigger as WorkflowManualTrigger;

        const { availabilityType, availabilityObjectMetadataId } =
          await this.resolveManualTriggerAvailability(trigger, workspaceId);

        const id = uuidv4();
        const now = new Date().toISOString();

        flatCommandMenuItemsToCreate.push({
          id,
          universalIdentifier: id,
          workflowVersionId: workflowVersion.id,
          frontComponentId: null,
          frontComponentUniversalIdentifier: null,
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label,
          shortLabel: label,
          icon: trigger.settings.icon ?? null,
          isPinned: trigger.settings.isPinned ?? false,
          position: 0,
          hotKeys: null,
          availabilityType,
          availabilityObjectMetadataId: availabilityObjectMetadataId ?? null,
          availabilityObjectMetadataUniversalIdentifier: null,
          conditionalAvailabilityExpression: null,
          workspaceId,
          applicationId: workspaceCustomFlatApplication.id,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          createdAt: now,
          updatedAt: now,
        });
      }

      if (flatCommandMenuItemsToCreate.length === 0) {
        this.logger.log(
          `No missing workflow command menu items for workspace ${workspaceId}`,
        );

        return;
      }

      this.logger.log(
        `Found ${flatCommandMenuItemsToCreate.length} missing workflow command menu item(s) for workspace ${workspaceId}`,
      );

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would create ${flatCommandMenuItemsToCreate.length} workflow command menu item(s) for workspace ${workspaceId}`,
        );

        return;
      }

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              commandMenuItem: {
                flatEntityToCreate: flatCommandMenuItemsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            queryRunner,
          },
        );

      if (validateAndBuildResult.status === 'fail') {
        this.logger.error(
          `Failed to backfill workflow command menu items:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
        );

        throw new Error(
          `Failed to backfill workflow command menu items for workspace ${workspaceId}`,
        );
      }

      this.logger.log(
        `Successfully backfilled ${flatCommandMenuItemsToCreate.length} workflow command menu item(s) for workspace ${workspaceId}`,
      );
    }, authContext);
  }

  private async resolveManualTriggerAvailability(
    trigger: WorkflowManualTrigger,
    workspaceId: string,
  ): Promise<{
    availabilityType: CommandMenuItemAvailabilityType;
    availabilityObjectMetadataId: string | undefined;
  }> {
    const availability = trigger.settings.availability;

    if (!isDefined(availability) || availability.type === 'GLOBAL') {
      return {
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        availabilityObjectMetadataId: undefined,
      };
    }

    const { objectIdByNameSingular } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    const objectId = objectIdByNameSingular[availability.objectNameSingular];

    if (!isDefined(objectId)) {
      this.logger.warn(
        `Object metadata not found for "${availability.objectNameSingular}" in workspace ${workspaceId}, falling back to GLOBAL`,
      );

      return {
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        availabilityObjectMetadataId: undefined,
      };
    }

    return {
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataId: objectId,
    };
  }
}
