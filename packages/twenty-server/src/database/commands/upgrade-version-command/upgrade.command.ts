import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import { type ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { BackfillPageLayoutUniversalIdentifiersCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-backfill-page-layout-universal-identifiers.command';
import { CleanEmptyStringNullInTextFieldsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-clean-empty-string-null-in-text-fields.command';
import { DeduplicateRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-deduplicate-role-targets.command';
import { MigrateStandardInvalidEntitiesCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-standard-invalid-entities.command';
import { MigrateTimelineActivityToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-timeline-activity-to-morph-relations.command';
import { RenameIndexNameCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-rename-index.command';
import { UpdateRoleTargetsUniqueConstraintMigrationCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-update-role-targets-unique-constraint-migration.command';
import { DeleteRemovedAgentsCommand } from 'src/database/commands/upgrade-version-command/1-14/1-14-delete-removed-agents.command';
import { UpdateCreatedByEnumCommand } from 'src/database/commands/upgrade-version-command/1-14/1-14-update-created-by-enum.command';
import { AddWorkspaceForeignKeysMigrationCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-add-workspace-foreign-keys-migration.command';
import { BackfillUpdatedByFieldCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-backfill-updated-by-field.command';
import { FixNanPositionValuesInNotesCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-fix-nan-position-values-in-notes.command';
import { MigratePageLayoutWidgetConfigurationCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-migrate-page-layout-widget-configuration.command';
import { BackfillOpportunityOwnerFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-opportunity-owner-field.command';
import { BackfillStandardPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-standard-page-layouts.command';
import { FlushV2CacheAndIncrementMetadataVersionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-flush-v2-cache-and-increment-metadata-version.command';
import { IdentifyAgentMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-agent-metadata.command';
import { IdentifyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-field-metadata.command';
import { IdentifyIndexMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-index-metadata.command';
import { IdentifyObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-object-metadata.command';
import { IdentifyRemainingEntitiesMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-remaining-entities-metadata.command';
import { IdentifyRoleMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-role-metadata.command';
import { IdentifyViewFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-field-metadata.command';
import { IdentifyViewFilterMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-filter-metadata.command';
import { IdentifyViewGroupMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-group-metadata.command';
import { IdentifyViewMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-metadata.command';
import { MakeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-agent-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-field-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-index-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-object-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-remaining-entities-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-role-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-field-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-filter-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-group-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-universal-identifier-and-application-id-not-nullable-migration.command';
import { UpdateTaskOnDeleteActionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-update-task-on-delete-action.command';
import { IdentifyWebhookMetadataCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-identify-webhook-metadata.command';
import { MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-make-webhook-universal-identifier-and-application-id-not-nullable-migration.command';
import { MigrateAttachmentToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-attachment-to-morph-relations.command';
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

    // 1.13 Commands
    protected readonly migrateTimelineActivityToMorphRelationsCommand: MigrateTimelineActivityToMorphRelationsCommand,
    protected readonly deduplicateRoleTargetsCommand: DeduplicateRoleTargetsCommand,
    protected readonly updateRoleTargetsUniqueConstraintMigrationCommand: UpdateRoleTargetsUniqueConstraintMigrationCommand,
    protected readonly backfillPageLayoutUniversalIdentifiersCommand: BackfillPageLayoutUniversalIdentifiersCommand,
    protected readonly migrateStandardInvalidEntitiesCommand: MigrateStandardInvalidEntitiesCommand,
    protected readonly cleanEmptyStringNullInTextFieldsCommand: CleanEmptyStringNullInTextFieldsCommand,
    protected readonly renameIndexNameCommand: RenameIndexNameCommand,

    // 1.14 Commands
    protected readonly updateCreatedByEnumCommand: UpdateCreatedByEnumCommand,
    protected readonly deleteRemovedAgentsCommand: DeleteRemovedAgentsCommand,

    // 1.15 Commands
    protected readonly migratePageLayoutWidgetConfigurationCommand: MigratePageLayoutWidgetConfigurationCommand,
    protected readonly fixNanPositionValuesInNotesCommand: FixNanPositionValuesInNotesCommand,
    protected readonly backfillUpdatedByFieldCommand: BackfillUpdatedByFieldCommand,
    protected readonly addWorkspaceForeignKeysMigrationCommand: AddWorkspaceForeignKeysMigrationCommand,

    // 1.16 Commands
    protected readonly updateTaskOnDeleteActionCommand: UpdateTaskOnDeleteActionCommand,
    protected readonly backfillOpportunityOwnerFieldCommand: BackfillOpportunityOwnerFieldCommand,
    protected readonly backfillStandardPageLayoutsCommand: BackfillStandardPageLayoutsCommand,
    protected readonly identifyAgentMetadataCommand: IdentifyAgentMetadataCommand,
    protected readonly identifyFieldMetadataCommand: IdentifyFieldMetadataCommand,
    protected readonly identifyIndexMetadataCommand: IdentifyIndexMetadataCommand,
    protected readonly identifyObjectMetadataCommand: IdentifyObjectMetadataCommand,
    protected readonly identifyRoleMetadataCommand: IdentifyRoleMetadataCommand,
    protected readonly identifyViewMetadataCommand: IdentifyViewMetadataCommand,
    protected readonly identifyViewFieldMetadataCommand: IdentifyViewFieldMetadataCommand,
    protected readonly identifyViewFilterMetadataCommand: IdentifyViewFilterMetadataCommand,
    protected readonly makeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly identifyViewGroupMetadataCommand: IdentifyViewGroupMetadataCommand,
    protected readonly makeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly makeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly identifyRemainingEntitiesMetadataCommand: IdentifyRemainingEntitiesMetadataCommand,
    protected readonly makeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly flushV2CacheAndIncrementMetadataVersionCommand: FlushV2CacheAndIncrementMetadataVersionCommand,

    // 1.17 Commands
    protected readonly migrateAttachmentToMorphRelationsCommand: MigrateAttachmentToMorphRelationsCommand,
    protected readonly identifyWebhookMetadataCommand: IdentifyWebhookMetadataCommand,
    protected readonly makeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      globalWorkspaceOrmManager,
      dataSourceService,
    );

    // Note: Required empty commands array to allow retrieving previous version
    const commands_1120: VersionCommands = [];

    const commands_1130: VersionCommands = [
      this.migrateTimelineActivityToMorphRelationsCommand,
      this.deduplicateRoleTargetsCommand,
      this.updateRoleTargetsUniqueConstraintMigrationCommand,
      this.backfillPageLayoutUniversalIdentifiersCommand,
      this.migrateStandardInvalidEntitiesCommand,
      this.cleanEmptyStringNullInTextFieldsCommand,
      this.renameIndexNameCommand,
    ];

    const commands_1140: VersionCommands = [
      this.updateCreatedByEnumCommand,
      this.deleteRemovedAgentsCommand,
    ];

    const commands_1150: VersionCommands = [
      this.migratePageLayoutWidgetConfigurationCommand,
      this.fixNanPositionValuesInNotesCommand,
      this.backfillUpdatedByFieldCommand,
      this.addWorkspaceForeignKeysMigrationCommand,
    ];

    const commands_1160: VersionCommands = [
      this.updateTaskOnDeleteActionCommand,
      this.identifyAgentMetadataCommand,
      this.identifyFieldMetadataCommand,
      this.identifyObjectMetadataCommand,
      this.identifyRoleMetadataCommand,
      this.identifyViewMetadataCommand,
      this.identifyViewFieldMetadataCommand,
      this.identifyViewFilterMetadataCommand,
      this.identifyViewGroupMetadataCommand,
      this.identifyIndexMetadataCommand,
      this.backfillOpportunityOwnerFieldCommand,
      this.backfillStandardPageLayoutsCommand,
      this
        .makeAgentUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeRoleUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeViewFilterUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeViewGroupUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this
        .makeIndexMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this.identifyRemainingEntitiesMetadataCommand,
      this
        .makeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this.flushV2CacheAndIncrementMetadataVersionCommand,
    ];

    const commands_1170: VersionCommands = [
      this.migrateAttachmentToMorphRelationsCommand,
      this.identifyWebhookMetadataCommand,
      this
        .makeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    ];

    this.allCommands = {
      '1.12.0': commands_1120,
      '1.13.0': commands_1130,
      '1.14.0': commands_1140,
      '1.15.0': commands_1150,
      '1.16.0': commands_1160,
      '1.17.0': commands_1170,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
