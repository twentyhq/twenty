import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export class addContextToActorCompositeType {}

@Command({
  name: 'upgrade-0.41:add-context-to-actor-composite-type',
  description: 'Add context to actor composite type.',
})
export class AddContextToActorCompositeTypeCommand extends ActiveWorkspacesCommandRunner {
  protected readonly logger: Logger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {
    super(workspaceRepository);
    this.logger = new Logger(this.constructor.name);
  }

  @Option({
    flags: '-w, --workspace-ids [workspaceIds]',
    description: 'Workspace ids to process (comma separated)',
    required: false,
  })
  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    _workspaceIds: string[],
  ): Promise<void> {
    const { dryRun } = _options;

    if (_options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }
    for (const workspaceId of _workspaceIds) {
      await this.execute(workspaceId, dryRun);
      this.logger.log(
        `Added context to actor composite type for workspace: ${workspaceId}`,
      );
    }
  }

  private async execute(workspaceId: string, dryRun = false): Promise<void> {
    this.logger.log(
      `Adding context to actor composite type for workspace: ${workspaceId}`,
    );
    // TODO

    console.log(objectMetadatas);
  }
}
