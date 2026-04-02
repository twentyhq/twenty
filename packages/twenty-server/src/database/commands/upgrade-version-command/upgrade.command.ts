import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';
import { VersionedMigrationRegistryService } from 'src/database/commands/core-migration-runner/services/versioned-migration-registry.service';
import { BackfillCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-command-menu-items.command';
import { BackfillNavigationMenuItemTypeCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-navigation-menu-item-type.command';
import { BackfillSelectFieldOptionIdsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-select-field-option-ids.command';
import { DeleteOrphanNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-delete-orphan-navigation-menu-items.command';
import { IdentifyFieldPermissionMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-identify-field-permission-metadata.command';
import { IdentifyObjectPermissionMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-identify-object-permission-metadata.command';
import { IdentifyPermissionFlagMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-identify-permission-flag-metadata.command';
import { MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-field-permission-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-object-permission-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-permission-flag-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeWorkflowSearchableCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-workflow-searchable.command';
import { MigrateMessagingInfrastructureToMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-migrate-messaging-infrastructure-to-metadata.command';
import { MigrateRichTextToTextCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-migrate-rich-text-to-text.command';
import { SeedCliApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-seed-cli-application-registration.command';
import { UpdateStandardIndexViewNamesCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-update-standard-index-view-names.command';
import { AddGlobalKeyValuePairUniqueIndexCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-add-global-key-value-pair-unique-index.command';
import { BackfillDatasourceToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-datasource-to-workspace.command';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-page-layouts-and-fields-widget-view-fields.command';
import { DeduplicateEngineCommandsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-deduplicate-engine-commands.command';
import { MigrateAiAgentTextToJsonResponseFormatCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-migrate-ai-agent-text-to-json-response-format.command';
import { UpdateEditLayoutCommandMenuItemLabelCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-update-edit-layout-command-menu-item-label.command';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  override allCommands: AllCommands;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly coreEngineVersionService: CoreEngineVersionService,
    protected readonly workspaceVersionService: WorkspaceVersionService,
    protected readonly coreMigrationRunnerService: CoreMigrationRunnerService,
    protected readonly versionedMigrationRegistryService: VersionedMigrationRegistryService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,

    // 1.20 Commands
    private readonly identifyPermissionFlagMetadataCommand: IdentifyPermissionFlagMetadataCommand,
    private readonly makePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    private readonly identifyObjectPermissionMetadataCommand: IdentifyObjectPermissionMetadataCommand,
    private readonly makeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    private readonly identifyFieldPermissionMetadataCommand: IdentifyFieldPermissionMetadataCommand,
    private readonly makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    private readonly backfillNavigationMenuItemTypeCommand: BackfillNavigationMenuItemTypeCommand,
    private readonly backfillCommandMenuItemsCommand: BackfillCommandMenuItemsCommand,
    private readonly deleteOrphanNavigationMenuItemsCommand: DeleteOrphanNavigationMenuItemsCommand,
    private readonly seedCliApplicationRegistrationCommand: SeedCliApplicationRegistrationCommand,
    private readonly migrateRichTextToTextCommand: MigrateRichTextToTextCommand,
    private readonly migrateMessagingInfrastructureToMetadataCommand: MigrateMessagingInfrastructureToMetadataCommand,
    private readonly backfillSelectFieldOptionIdsCommand: BackfillSelectFieldOptionIdsCommand,
    private readonly updateStandardIndexViewNamesCommand: UpdateStandardIndexViewNamesCommand,
    private readonly makeWorkflowSearchableCommand: MakeWorkflowSearchableCommand,

    // 1.21 Commands
    private readonly addGlobalKeyValuePairUniqueIndexCommand: AddGlobalKeyValuePairUniqueIndexCommand,
    private readonly backfillDatasourceToWorkspaceCommand: BackfillDatasourceToWorkspaceCommand,
    private readonly backfillPageLayoutsAndFieldsWidgetViewFieldsCommand: BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    private readonly deduplicateEngineCommandsCommand: DeduplicateEngineCommandsCommand,
    private readonly migrateAiAgentTextToJsonResponseFormatCommand: MigrateAiAgentTextToJsonResponseFormatCommand,
    private readonly updateEditLayoutCommandMenuItemLabelCommand: UpdateEditLayoutCommandMenuItemLabelCommand,
  ) {
    super(
      workspaceRepository,
      coreEngineVersionService,
      workspaceVersionService,
      coreMigrationRunnerService,
      versionedMigrationRegistryService,
      workspaceIteratorService,
    );

    const commands_1200: VersionCommands = [
      this.identifyPermissionFlagMetadataCommand,
      this
        .makePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this.identifyObjectPermissionMetadataCommand,
      this
        .makeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this.identifyFieldPermissionMetadataCommand,
      this
        .makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
      this.backfillNavigationMenuItemTypeCommand,
      this.migrateRichTextToTextCommand,
      this.deleteOrphanNavigationMenuItemsCommand,
      this.backfillCommandMenuItemsCommand,
      this.seedCliApplicationRegistrationCommand,
      this.migrateMessagingInfrastructureToMetadataCommand,
      this.backfillSelectFieldOptionIdsCommand,
      this.updateStandardIndexViewNamesCommand,
      this.makeWorkflowSearchableCommand,
    ];

    const commands_1210: VersionCommands = [
      this.addGlobalKeyValuePairUniqueIndexCommand,
      this.backfillDatasourceToWorkspaceCommand,
      this.backfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
      this.deduplicateEngineCommandsCommand,
      this.migrateAiAgentTextToJsonResponseFormatCommand,
      this.updateEditLayoutCommandMenuItemLabelCommand,
    ];

    this.allCommands = {
      '1.19.0': [],
      '1.20.0': commands_1200,
      '1.21.0': commands_1210,
    };
  }
}
