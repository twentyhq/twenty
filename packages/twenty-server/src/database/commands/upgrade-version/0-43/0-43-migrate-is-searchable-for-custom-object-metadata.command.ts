import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Repository } from 'typeorm';

import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import {
  MaintainedWorkspacesMigrationCommandOptions,
  MaintainedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/migration-command/maintained-workspaces-migration-command.runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@MigrationCommand({
  name: 'migrate-is-searchable-for-custom-object-metadata',
  description: 'Set isSearchable true for custom object metadata',
  version: '0.43',
})
export class MigrateIsSearchableForCustomObjectMetadataCommand extends MaintainedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  async runMigrationCommandOnMaintainedWorkspaces(
    _passedParam: string[],
    _options: MaintainedWorkspacesMigrationCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      chalk.green(
        'Running command to set isSearchable true for custom object metadata',
      ),
    );

    for (const [index, workspaceId] of workspaceIds.entries()) {
      await this.processWorkspace(workspaceId, index, workspaceIds.length);
    }

    this.logger.log(chalk.green('Command completed!'));
  }

  private async processWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      await this.objectMetadataRepository.update(
        {
          workspaceId,
          isCustom: true,
        },
        {
          isSearchable: true,
        },
      );
    } catch (error) {
      this.logger.log(
        chalk.red(`Error in workspace ${workspaceId} - ${error.message}`),
      );
    }
  }
}
