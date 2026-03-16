import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';

@Command({
  name: 'upgrade:1-20:seed-cli-application-registration',
  description:
    'Seed the Twenty CLI application registration for OAuth-based CLI login',
})
export class SeedCliApplicationRegistrationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRun = false;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId: _,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    if (this.hasRun) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        '[DRY RUN] Skipping CLI application registration seeding',
      );
      return;
    }

    const result =
      await this.applicationRegistrationService.createCliRegistrationIfNotExists();

    this.hasRun = true;

    if (result) {
      this.logger.log(
        `CLI application registration created (clientId: ${result.oAuthClientId})`,
      );
    } else {
      this.logger.log('CLI application registration already exists, skipping');
    }
  }
}
