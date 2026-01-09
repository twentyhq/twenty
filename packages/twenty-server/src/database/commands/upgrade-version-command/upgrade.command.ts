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

    this.allCommands = {
      '1.12.0': commands_1120,
      '1.13.0': commands_1130,
      '1.14.0': commands_1140,
      '1.15.0': commands_1150,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
