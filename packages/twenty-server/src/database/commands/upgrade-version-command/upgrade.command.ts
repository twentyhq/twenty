import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { type ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { CleanNotFoundFilesCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-clean-not-found-files.command';
import { FixCreatedByDefaultValueCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-created-by-default-value.command';
import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-fix-standard-select-fields-position.command';
import { LowercaseUserAndInvitationEmailsCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-lowercase-user-and-invitation-emails.command';
import { MigrateDefaultAvatarUrlToUserWorkspaceCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-migrate-default-avatar-url-to-user-workspace.command';
import { DeduplicateIndexedFieldsCommand } from 'src/database/commands/upgrade-version-command/0-55/0-55-deduplicate-indexed-fields.command';
import { AddEnqueuedStatusToWorkflowRunCommand } from 'src/database/commands/upgrade-version-command/1-1/1-1-add-enqueued-status-to-workflow-run.command';
import { FixSchemaArrayTypeCommand } from 'src/database/commands/upgrade-version-command/1-1/1-1-fix-schema-array-type.command';
import { FixUpdateStandardFieldsIsLabelSyncedWithName } from 'src/database/commands/upgrade-version-command/1-1/1-1-fix-update-standard-field-is-label-synced-with-name.command';
import { MigrateWorkflowRunStatesCommand } from 'src/database/commands/upgrade-version-command/1-1/1-1-migrate-workflow-run-state.command';
import { AddEnqueuedStatusToWorkflowRunV2Command } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-enqueued-status-to-workflow-run-v2.command';
import { AddNextStepIdsToWorkflowVersionTriggers } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-next-step-ids-to-workflow-version-triggers.command';
import { RemoveWorkflowRunsWithoutState } from 'src/database/commands/upgrade-version-command/1-2/1-2-remove-workflow-runs-without-state.command';
import { AddNextStepIdsToWorkflowRunsTrigger } from 'src/database/commands/upgrade-version-command/1-3/1-3-add-next-step-ids-to-workflow-runs-trigger.command';
import { UpdateTimestampColumnTypeInWorkspaceSchemaCommand } from 'src/database/commands/upgrade-version-command/1-3/1-3-update-timestamp-column-type-in-workspace-schema.command';
import { AddPositionsToWorkflowVersionsAndWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/1-5/1-5-add-positions-to-workflow-versions-and-workflow-runs.command';
import { MigrateViewsToCoreCommand } from 'src/database/commands/upgrade-version-command/1-5/1-5-migrate-views-to-core.command';
import { RemoveFavoriteViewRelationCommand } from 'src/database/commands/upgrade-version-command/1-5/1-5-remove-favorite-view-relation.command';
import { FixLabelIdentifierPositionAndVisibilityCommand } from 'src/database/commands/upgrade-version-command/1-6/1-6-fix-label-identifier-position-and-visibility.command';
import { BackfillWorkflowManualTriggerAvailabilityCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-backfill-workflow-manual-trigger-availability.command';
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
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    // 0.54 Commands
    protected readonly fixStandardSelectFieldsPositionCommand: FixStandardSelectFieldsPositionCommand,
    protected readonly fixCreatedByDefaultValueCommand: FixCreatedByDefaultValueCommand,
    protected readonly cleanNotFoundFilesCommand: CleanNotFoundFilesCommand,
    protected readonly lowercaseUserAndInvitationEmailsCommand: LowercaseUserAndInvitationEmailsCommand,
    protected readonly migrateDefaultAvatarUrlToUserWorkspaceCommand: MigrateDefaultAvatarUrlToUserWorkspaceCommand,

    // 0.55 Commands
    protected readonly deduplicateIndexedFieldsCommand: DeduplicateIndexedFieldsCommand,

    // 1.1 Commands
    protected readonly fixSchemaArrayTypeCommand: FixSchemaArrayTypeCommand,
    protected readonly fixUpdateStandardFieldsIsLabelSyncedWithNameCommand: FixUpdateStandardFieldsIsLabelSyncedWithName,
    protected readonly migrateWorkflowRunStatesCommand: MigrateWorkflowRunStatesCommand,
    protected readonly addEnqueuedStatusToWorkflowRunCommand: AddEnqueuedStatusToWorkflowRunCommand,

    // 1.2 Commands
    protected readonly removeWorkflowRunsWithoutState: RemoveWorkflowRunsWithoutState,
    protected readonly addNextStepIdsToWorkflowVersionTriggers: AddNextStepIdsToWorkflowVersionTriggers,
    protected readonly addEnqueuedStatusToWorkflowRunV2Command: AddEnqueuedStatusToWorkflowRunV2Command,

    // 1.3 Commands
    protected readonly addNextStepIdsToWorkflowRunsTrigger: AddNextStepIdsToWorkflowRunsTrigger,
    protected readonly updateTimestampColumnTypeInWorkspaceSchemaCommand: UpdateTimestampColumnTypeInWorkspaceSchemaCommand,

    // 1.5 Commands
    protected readonly removeFavoriteViewRelationCommand: RemoveFavoriteViewRelationCommand,
    protected readonly addPositionsToWorkflowVersionsAndWorkflowRunsCommand: AddPositionsToWorkflowVersionsAndWorkflowRunsCommand,
    protected readonly migrateViewsToCoreCommand: MigrateViewsToCoreCommand,

    // 1.6 Commands
    protected readonly fixLabelIdentifierPositionAndVisibilityCommand: FixLabelIdentifierPositionAndVisibilityCommand,

    // 1.7 Commands
    protected readonly backfillWorkflowManualTriggerAvailabilityCommand: BackfillWorkflowManualTriggerAvailabilityCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );

    const commands_053: VersionCommands = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    };

    const commands_054: VersionCommands = {
      beforeSyncMetadata: [
        this.fixStandardSelectFieldsPositionCommand,
        this.fixCreatedByDefaultValueCommand,
      ],
      afterSyncMetadata: [
        this.cleanNotFoundFilesCommand,
        this.lowercaseUserAndInvitationEmailsCommand,
        this.migrateDefaultAvatarUrlToUserWorkspaceCommand,
      ],
    };

    const commands_055: VersionCommands = {
      beforeSyncMetadata: [this.deduplicateIndexedFieldsCommand],
      afterSyncMetadata: [],
    };

    const commands_060: VersionCommands = {
      afterSyncMetadata: [],
      beforeSyncMetadata: [],
    };

    const commands_100: VersionCommands = {
      afterSyncMetadata: [],
      beforeSyncMetadata: [],
    };

    const commands_110: VersionCommands = {
      beforeSyncMetadata: [
        this.fixUpdateStandardFieldsIsLabelSyncedWithNameCommand,
        this.fixSchemaArrayTypeCommand,
        this.addEnqueuedStatusToWorkflowRunCommand,
      ],
      afterSyncMetadata: [this.migrateWorkflowRunStatesCommand],
    };

    const commands_120: VersionCommands = {
      beforeSyncMetadata: [
        this.removeWorkflowRunsWithoutState,
        this.addNextStepIdsToWorkflowVersionTriggers,
        this.addEnqueuedStatusToWorkflowRunV2Command,
      ],
      afterSyncMetadata: [],
    };

    const commands_130: VersionCommands = {
      beforeSyncMetadata: [
        this.addNextStepIdsToWorkflowVersionTriggers, // We add that command again because nextStepIds where not added on freshly created triggers. It will be done in 1.3
        this.addNextStepIdsToWorkflowRunsTrigger,
        this.updateTimestampColumnTypeInWorkspaceSchemaCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_140: VersionCommands = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    };

    const commands_150: VersionCommands = {
      beforeSyncMetadata: [
        this.migrateViewsToCoreCommand,
        this.removeFavoriteViewRelationCommand,
        this.addPositionsToWorkflowVersionsAndWorkflowRunsCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_160: VersionCommands = {
      beforeSyncMetadata: [this.fixLabelIdentifierPositionAndVisibilityCommand],
      afterSyncMetadata: [],
    };

    const commands_170: VersionCommands = {
      beforeSyncMetadata: [
        this.backfillWorkflowManualTriggerAvailabilityCommand,
      ],
      afterSyncMetadata: [],
    };

    this.allCommands = {
      '0.53.0': commands_053,
      '0.54.0': commands_054,
      '0.55.0': commands_055,
      '0.60.0': commands_060,
      '1.0.0': commands_100,
      '1.1.0': commands_110,
      '1.2.0': commands_120,
      '1.3.0': commands_130,
      '1.4.0': commands_140,
      '1.5.0': commands_150,
      '1.6.0': commands_160,
      '1.7.0': commands_170,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
