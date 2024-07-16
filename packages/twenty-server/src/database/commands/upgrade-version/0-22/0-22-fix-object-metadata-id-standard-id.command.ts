import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { AUDIT_LOGS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

interface FixObjectMetadataIdStandardIdCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.22:fix-object-metadata-id-standard-id',
  description: 'Fix object metadata id standard id',
})
export class FixObjectMetadataIdStandardIdCommand extends CommandRunner {
  private readonly logger = new Logger(
    FixObjectMetadataIdStandardIdCommand.name,
  );
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: FixObjectMetadataIdStandardIdCommandOptions,
  ): Promise<void> {
    const workspaceIds = options.workspaceId
      ? [options.workspaceId]
      : (await this.workspaceRepository.find()).map(
          (workspace) => workspace.id,
        );

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    }

    this.logger.log(
      chalk.green(`Running command on ${workspaceIds.length} workspaces`),
    );

    const metadataQueryRunner = this.metadataDataSource.createQueryRunner();

    await metadataQueryRunner.connect();

    const fieldMetadataRepository =
      metadataQueryRunner.manager.getRepository(FieldMetadataEntity);

    for (const workspaceId of workspaceIds) {
      try {
        await metadataQueryRunner.startTransaction();

        await fieldMetadataRepository.delete({
          workspaceId,
          standardId: AUDIT_LOGS_STANDARD_FIELD_IDS.objectName,
          name: 'objectMetadataId',
        });

        await metadataQueryRunner.commitTransaction();
      } catch (error) {
        await metadataQueryRunner.rollbackTransaction();
        this.logger.log(
          chalk.red(`Running command on workspace ${workspaceId} failed`),
        );
        throw error;
      }

      await this.workspaceCacheVersionService.incrementVersion(workspaceId);

      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );
    }

    await metadataQueryRunner.release();

    this.logger.log(chalk.green(`Command completed!`));
  }
}
