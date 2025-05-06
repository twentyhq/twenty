import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Command } from 'nest-commander';
import { AllCommands, UpgradeCommandRunner, VersionCommands } from 'src/database/commands/command-runners/upgrade.command-runner';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateIsSearchableForCustomObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-is-searchable-for-custom-object-metadata.command';
import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { InitializePermissionsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-initialize-permissions.command';
import { UpdateViewAggregateOperationsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-update-view-aggregate-operations.command';
import { UpgradeCreatedByEnumCommand } from 'src/database/commands/upgrade-version-command/0-51/0-51-update-workflow-trigger-type-enum.command';
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-migrate-relations-to-field-metadata.command';
import { UpgradeDateAndDateTimeFieldsSettingsJsonCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-upgrade-settings-field';
import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-backfill-workflow-next-step-ids.command';
import { MigrateWorkflowEventListenersToAutomatedTriggersCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-migrate-workflow-event-listeners-to-automated-triggers.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  override allCommands: AllCommands;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    // 0.43 Commands
    protected readonly migrateRichTextContentPatchCommand: MigrateRichTextContentPatchCommand,
    protected readonly addTasksAssignedToMeViewCommand: AddTasksAssignedToMeViewCommand,
    protected readonly migrateIsSearchableForCustomObjectMetadataCommand: MigrateIsSearchableForCustomObjectMetadataCommand,
    protected readonly updateDefaultViewRecordOpeningOnWorkflowObjectsCommand: UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    protected readonly migrateSearchVectorOnNoteAndTaskEntitiesCommand: MigrateSearchVectorOnNoteAndTaskEntitiesCommand,

    // 0.44 Commands
    protected readonly initializePermissionsCommand: InitializePermissionsCommand,
    protected readonly updateViewAggregateOperationsCommand: UpdateViewAggregateOperationsCommand,

    // 0.51 Commands
    protected readonly upgradeCreatedByEnumCommand: UpgradeCreatedByEnumCommand,

    // 0.52 Commands
    protected readonly upgradeDateAndDateTimeFieldsSettingsJsonCommand: UpgradeDateAndDateTimeFieldsSettingsJsonCommand,
    protected readonly migrateRelationsToFieldMetadataCommand: MigrateRelationsToFieldMetadataCommand,

    // 0.53 Commands
    protected readonly migrateWorkflowEventListenersToAutomatedTriggersCommand: MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    protected readonly backfillWorkflowNextStepIdsCommand: BackfillWorkflowNextStepIdsCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );
    
    const commands_043: VersionCommands = {
      beforeSyncMetadata: [
        this.migrateRichTextContentPatchCommand,
        this.migrateIsSearchableForCustomObjectMetadataCommand,
        this.migrateSearchVectorOnNoteAndTaskEntitiesCommand,
        this.migrateIsSearchableForCustomObjectMetadataCommand,
      ],
      afterSyncMetadata: [
        this.updateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
        this.addTasksAssignedToMeViewCommand,
      ],
    };
    const commands_044: VersionCommands = {
      beforeSyncMetadata: [
        this.initializePermissionsCommand,
        this.updateViewAggregateOperationsCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_050: VersionCommands = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    };

    const commands_051: VersionCommands = {
      beforeSyncMetadata: [this.upgradeCreatedByEnumCommand],
      afterSyncMetadata: [],
    };

    const commands_052: VersionCommands = {
      beforeSyncMetadata: [
        this.upgradeDateAndDateTimeFieldsSettingsJsonCommand,
        this.migrateRelationsToFieldMetadataCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_053: VersionCommands = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [
        this.migrateWorkflowEventListenersToAutomatedTriggersCommand,
        this.backfillWorkflowNextStepIdsCommand,
      ],
    };

    this.allCommands = {
      '0.43.0': commands_043,
      '0.44.0': commands_044,
      '0.50.0': commands_050,
      '0.51.0': commands_051,
      '0.52.0': commands_052,
      '0.53.0': commands_053,
    }
  }
}
