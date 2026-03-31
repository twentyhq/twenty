import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import { type ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { CoreMigrationRunnerService } from 'src/database/commands/core-migration-runner/services/core-migration-runner.service';
import { BackfillCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-command-menu-items.command';
import { BackfillNavigationMenuItemTypeCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-navigation-menu-item-type.command';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-page-layouts-and-fields-widget-view-fields.command';
import { IdentifyFieldPermissionMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-identify-field-permission-metadata.command';
import { BackfillSelectFieldOptionIdsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-select-field-option-ids.command';
import { DeleteOrphanNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-delete-orphan-navigation-menu-items.command';
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
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly coreEngineVersionService: CoreEngineVersionService,
    protected readonly workspaceVersionService: WorkspaceVersionService,
    protected readonly coreMigrationRunnerService: CoreMigrationRunnerService,

    // 1.20 Commands
    protected readonly identifyPermissionFlagMetadataCommand: IdentifyPermissionFlagMetadataCommand,
    protected readonly makePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly identifyObjectPermissionMetadataCommand: IdentifyObjectPermissionMetadataCommand,
    protected readonly makeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly identifyFieldPermissionMetadataCommand: IdentifyFieldPermissionMetadataCommand,
    protected readonly makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand: MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    protected readonly backfillNavigationMenuItemTypeCommand: BackfillNavigationMenuItemTypeCommand,
    protected readonly backfillCommandMenuItemsCommand: BackfillCommandMenuItemsCommand,
    protected readonly deleteOrphanNavigationMenuItemsCommand: DeleteOrphanNavigationMenuItemsCommand,
    protected readonly seedCliApplicationRegistrationCommand: SeedCliApplicationRegistrationCommand,
    protected readonly migrateRichTextToTextCommand: MigrateRichTextToTextCommand,
    protected readonly migrateMessagingInfrastructureToMetadataCommand: MigrateMessagingInfrastructureToMetadataCommand,
    protected readonly backfillSelectFieldOptionIdsCommand: BackfillSelectFieldOptionIdsCommand,
    protected readonly updateStandardIndexViewNamesCommand: UpdateStandardIndexViewNamesCommand,
    protected readonly makeWorkflowSearchableCommand: MakeWorkflowSearchableCommand,

    // 1.21 Commands
    protected readonly backfillPageLayoutsAndFieldsWidgetViewFieldsCommand: BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      globalWorkspaceOrmManager,
      dataSourceService,
      coreEngineVersionService,
      workspaceVersionService,
      coreMigrationRunnerService,
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
      this.backfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    ];

    this.allCommands = {
      '1.19.0': [],
      '1.20.0': commands_1200,
      '1.21.0': commands_1210,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
