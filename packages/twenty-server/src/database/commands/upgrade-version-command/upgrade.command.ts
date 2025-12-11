import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { type ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { BackfillPageLayoutUniversalIdentifiersCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-backfill-page-layout-universal-identifiers.command';
import { DeduplicateRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-deduplicate-role-targets.command';
import { MigrateStandardInvalidEntitiesCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-standard-invalid-entities.command';
import { MigrateTimelineActivityToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-timeline-activity-to-morph-relations.command';
import { UpdateRoleTargetsUniqueConstraintMigrationCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-update-role-targets-unique-constraint-migration.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

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
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    // 1.13 Commands
    protected readonly migrateTimelineActivityToMorphRelationsCommand: MigrateTimelineActivityToMorphRelationsCommand,
    protected readonly deduplicateRoleTargetsCommand: DeduplicateRoleTargetsCommand,
    protected readonly updateRoleTargetsUniqueConstraintMigrationCommand: UpdateRoleTargetsUniqueConstraintMigrationCommand,
    protected readonly backfillPageLayoutUniversalIdentifiersCommand: BackfillPageLayoutUniversalIdentifiersCommand,
    protected readonly migrateStandardInvalidEntitiesCommand: MigrateStandardInvalidEntitiesCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      globalWorkspaceOrmManager,
      dataSourceService,
      syncWorkspaceMetadataCommand,
    );

    const commands_1130: VersionCommands = [
      this.migrateTimelineActivityToMorphRelationsCommand,
      this.deduplicateRoleTargetsCommand,
      this.updateRoleTargetsUniqueConstraintMigrationCommand,
      this.backfillPageLayoutUniversalIdentifiersCommand,
      this.migrateStandardInvalidEntitiesCommand,
    ];

    this.allCommands = {
      '1.12.0': [], // We might be able to remove this but to be checked
      '1.13.0': commands_1130,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
