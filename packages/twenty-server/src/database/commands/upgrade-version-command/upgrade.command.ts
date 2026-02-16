import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import { type ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { BackfillApplicationPackageFilesCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-backfill-application-package-files.command';
import { DeleteFileRecordsAndUpdateTableCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-delete-all-files-and-update-table.command';
import { FixMorphRelationFieldNamesCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-fix-morph-relation-field-names.command';
import { IdentifyWebhookMetadataCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-identify-webhook-metadata.command';
import { MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-make-webhook-universal-identifier-and-application-id-not-nullable-migration.command';
import { MigrateAttachmentToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-attachment-to-morph-relations.command';
import { MigrateFavoritesToNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-favorites-to-navigation-menu-items.command';
import { MigrateNoteTargetToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-note-target-to-morph-relations.command';
import { MigrateTaskTargetToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-task-target-to-morph-relations.command';
import { MigrateWorkflowCodeStepsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-workflow-code-steps.command';
import { BackfillFileSizeAndMimeTypeCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-file-size-and-mime-type.command';
import { BackfillMessageChannelThrottleRetryAfterCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-message-channel-throttle-retry-after.command';
import { MigrateActivityRichTextAttachmentFileIdsCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-activity-rich-text-attachment-file-ids.command';
import { MigrateAttachmentFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-attachment-files.command';
import { MigratePersonAvatarFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-person-avatar-files.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  override allCommands: AllCommands;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,

    // 1.17 Commands
    protected readonly backfillApplicationPackageFilesCommand: BackfillApplicationPackageFilesCommand,
    protected readonly deleteFileRecordsAndUpdateTableCommand: DeleteFileRecordsAndUpdateTableCommand,
    protected readonly migrateAttachmentToMorphRelationsCommand: MigrateAttachmentToMorphRelationsCommand,
    protected readonly migrateFavoritesToNavigationMenuItemsCommand: MigrateFavoritesToNavigationMenuItemsCommand,
    protected readonly migrateNoteTargetToMorphRelationsCommand: MigrateNoteTargetToMorphRelationsCommand,
    protected readonly migrateTaskTargetToMorphRelationsCommand: MigrateTaskTargetToMorphRelationsCommand,
    protected readonly identifyWebhookMetadataCommand: IdentifyWebhookMetadataCommand,
    protected readonly makeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly migrateWorkflowCodeStepsCommand: MigrateWorkflowCodeStepsCommand,
    protected readonly fixMorphRelationFieldNamesCommand: FixMorphRelationFieldNamesCommand,

    // 1.18 Commands
    protected readonly migratePersonAvatarFilesCommand: MigratePersonAvatarFilesCommand,
    protected readonly backfillFileSizeAndMimeTypeCommand: BackfillFileSizeAndMimeTypeCommand,
    protected readonly migrateAttachmentFilesCommand: MigrateAttachmentFilesCommand,
    protected readonly migrateActivityRichTextAttachmentFileIdsCommand: MigrateActivityRichTextAttachmentFileIdsCommand,
    protected readonly backfillMessageChannelThrottleRetryAfterCommand: BackfillMessageChannelThrottleRetryAfterCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      globalWorkspaceOrmManager,
      dataSourceService,
    );

    // Note: Required empty commands array to allow retrieving previous version
    const commands_1160: VersionCommands = [];

    const commands_1170: VersionCommands = [
      this.migrateAttachmentToMorphRelationsCommand,
      this.migrateFavoritesToNavigationMenuItemsCommand,
      this.migrateNoteTargetToMorphRelationsCommand,
      this.migrateTaskTargetToMorphRelationsCommand,
      this.identifyWebhookMetadataCommand,
      this
        .makeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this.deleteFileRecordsAndUpdateTableCommand,
      this.migrateWorkflowCodeStepsCommand,
      this.backfillApplicationPackageFilesCommand,
      this.fixMorphRelationFieldNamesCommand,
    ];

    const commands_1180: VersionCommands = [
      this.migratePersonAvatarFilesCommand,
      this.migrateAttachmentFilesCommand,
      this.migrateActivityRichTextAttachmentFileIdsCommand,
      this.backfillFileSizeAndMimeTypeCommand,
      this.backfillMessageChannelThrottleRetryAfterCommand,
    ];

    this.allCommands = {
      '1.16.0': commands_1160,
      '1.17.0': commands_1170,
      '1.18.0': commands_1180,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
