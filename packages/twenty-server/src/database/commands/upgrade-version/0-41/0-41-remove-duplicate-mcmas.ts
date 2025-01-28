import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
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

@Command({
  name: 'upgrade-0.41:remove-duplicate-mcmas',
  description: 'Remove duplicate mcmas.',
})
export class RemoveDuplicateMcmasCommand extends ActiveWorkspacesCommandRunner {
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

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    const { dryRun } = _options;

    for (const workspaceId of workspaceIds) {
      await this.execute(workspaceId, dryRun);
    }
  }

  private async execute(workspaceId: string, dryRun = false): Promise<void> {
    this.logger.log(`Removing duplicate mcmas for workspace: ${workspaceId}`);

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'messageChannelMessageAssociation',
      );

    const queryBuilder = repository.createQueryBuilder(
      'messageChannelMessageAssociation',
    );

    const duplicateMcmas = await queryBuilder
      .select(`"messageChannelId"`)
      .addSelect(`"messageId"`)
      .where(`"deletedAt" IS NULL`)
      .groupBy(`"messageId"`)
      .addGroupBy(`"messageChannelId"`)
      .having(`COUNT("messageChannelId") > 1`)
      .getRawMany();

    this.logger.log(`Found ${duplicateMcmas.length} duplicate mcmas`);

    for (const duplicateMca of duplicateMcmas) {
      const mcmas = await repository.find({
        where: {
          messageId: duplicateMca.messageId,
          messageChannelId: duplicateMca.messageChannelId,
        },
      });

      this.logger.log(
        `Found ${mcmas.length} mcmas for message ${duplicateMca.messageId} and message channel ${duplicateMca.messageChannelId}`,
      );

      const mcaIdsToDelete = mcmas.slice(1).map((mca) => mca.id);

      if (mcaIdsToDelete.length > 0) {
        this.logger.log(`Deleting ${mcaIdsToDelete.length} mcas`);
        if (!dryRun) {
          await repository.delete(mcaIdsToDelete);
        }
      }
    }
  }
}
