import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
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
    'Backfill missing standard and trigger workflow version command menu items for existing workspaces and enable IS_COMMAND_MENU_ITEM_ENABLED feature flag',
})
export class BackfillCommandMenuItemsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
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

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const standardCommandMenuItems =
      await this.computeStandardCommandMenuItemsToCreate(
        workspaceId,
        twentyStandardFlatApplication,
      );

    const triggerWorkflowVersionCommandMenuItems =
      await this.computeTriggerWorkflowVersionCommandMenuItemsToCreate(
        workspaceId,
        workspaceCustomFlatApplication,
      );

    const totalCount =
      standardCommandMenuItems.length +
      triggerWorkflowVersionCommandMenuItems.length;

    if (totalCount === 0) {
      this.logger.log(
        `No missing command menu items for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${totalCount} missing command menu item(s) for workspace ${workspaceId} (${standardCommandMenuItems.length} standard, ${triggerWorkflowVersionCommandMenuItems.length} trigger workflow version)`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${totalCount} command menu item(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (standardCommandMenuItems.length > 0) {
      await this.createCommandMenuItems({
        workspaceId,
        flatCommandMenuItemsToCreate: standardCommandMenuItems,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
      });
    }

    if (triggerWorkflowVersionCommandMenuItems.length > 0) {
      await this.createCommandMenuItems({
        workspaceId,
        flatCommandMenuItemsToCreate: triggerWorkflowVersionCommandMenuItems,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });
    }

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Successfully backfilled ${totalCount} command menu item(s) for workspace ${workspaceId}`,
    );
  }

  private async computeStandardCommandMenuItemsToCreate(
    workspaceId: string,
    twentyStandardFlatApplication: FlatApplication,
  ): Promise<FlatCommandMenuItem[]> {
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

    if (commandMenuItemsToCreate.length > 0) {
      this.logger.log(
        `Found ${commandMenuItemsToCreate.length} missing standard command menu item(s) for workspace ${workspaceId}`,
      );
    }

    return commandMenuItemsToCreate;
  }

  private async computeTriggerWorkflowVersionCommandMenuItemsToCreate(
    workspaceId: string,
    workspaceCustomFlatApplication: FlatApplication,
  ): Promise<FlatCommandMenuItem[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return await this.twentyORMGlobalManager.executeInWorkspaceContext(
      async () => {
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

          return [];
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

          const {
            availabilityType,
            availabilityObjectMetadataId,
            availabilityObjectMetadataUniversalIdentifier,
          } = await this.resolveManualTriggerAvailability(trigger, workspaceId);

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
            availabilityObjectMetadataUniversalIdentifier,
            conditionalAvailabilityExpression: null,
            workspaceId,
            applicationId: workspaceCustomFlatApplication.id,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            createdAt: now,
            updatedAt: now,
          });
        }

        if (flatCommandMenuItemsToCreate.length > 0) {
          this.logger.log(
            `Found ${flatCommandMenuItemsToCreate.length} missing trigger workflow version command menu item(s) for workspace ${workspaceId}`,
          );
        }

        return flatCommandMenuItemsToCreate;
      },
      authContext,
    );
  }

  private async createCommandMenuItems({
    workspaceId,
    flatCommandMenuItemsToCreate,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    flatCommandMenuItemsToCreate: FlatCommandMenuItem[];
    applicationUniversalIdentifier: string;
  }): Promise<void> {
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
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill command menu items:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill command menu items for workspace ${workspaceId}`,
      );
    }
  }

  private async resolveManualTriggerAvailability(
    trigger: WorkflowManualTrigger,
    workspaceId: string,
  ): Promise<{
    availabilityType: CommandMenuItemAvailabilityType;
    availabilityObjectMetadataId: string | undefined;
    availabilityObjectMetadataUniversalIdentifier: string | null;
  }> {
    const availability = trigger.settings.availability;

    if (!isDefined(availability) || availability.type === 'GLOBAL') {
      return {
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        availabilityObjectMetadataId: undefined,
        availabilityObjectMetadataUniversalIdentifier: null,
      };
    }

    const { objectIdByNameSingular, flatObjectMetadataMaps } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    const objectId = objectIdByNameSingular[availability.objectNameSingular];

    if (!isDefined(objectId)) {
      this.logger.warn(
        `Object metadata not found for "${availability.objectNameSingular}" in workspace ${workspaceId}, falling back to GLOBAL`,
      );

      return {
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        availabilityObjectMetadataId: undefined,
        availabilityObjectMetadataUniversalIdentifier: null,
      };
    }

    const objectUniversalIdentifier =
      flatObjectMetadataMaps.universalIdentifierById[objectId] ?? null;

    return {
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataId: objectId,
      availabilityObjectMetadataUniversalIdentifier: objectUniversalIdentifier,
    };
  }
}
