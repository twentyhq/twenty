import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository, IsNull, DataSource } from 'typeorm';
import chalk from 'chalk';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

interface UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.22:update-boolean-field-null-default-values-and-null-values',
  description:
    'Update boolean fields null default values and null values to false',
})
export class UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand extends CommandRunner {
  private readonly logger = new Logger(
    UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand.name,
  );
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
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
    options: UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommandOptions,
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

    for (const workspaceId of workspaceIds) {
      const dataSourceMetadata =
        await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
          workspaceId,
        );

      if (!dataSourceMetadata) {
        throw new Error(
          `Could not find dataSourceMetadata for workspace ${workspaceId}`,
        );
      }

      const workspaceDataSource =
        await this.typeORMService.connectToDataSource(dataSourceMetadata);

      if (!workspaceDataSource) {
        throw new Error(
          `Could not connect to dataSource for workspace ${workspaceId}`,
        );
      }

      const workspaceQueryRunner = workspaceDataSource.createQueryRunner();
      const metadataQueryRunner = this.metadataDataSource.createQueryRunner();

      await workspaceQueryRunner.connect();
      await metadataQueryRunner.connect();

      await workspaceQueryRunner.startTransaction();
      await metadataQueryRunner.startTransaction();

      try {
        const fieldMetadataRepository =
          metadataQueryRunner.manager.getRepository(FieldMetadataEntity);

        const booleanFieldsWithoutDefaultValue =
          await fieldMetadataRepository.find({
            where: {
              workspaceId,
              type: FieldMetadataType.BOOLEAN,
              defaultValue: IsNull(),
            },
            relations: ['object'],
          });

        for (const booleanField of booleanFieldsWithoutDefaultValue) {
          if (!booleanField.object) {
            throw new Error(
              `Could not find objectMetadataItem for field ${booleanField.id}`,
            );
          }

          // Could be done via a batch update but it's safer in this context to run it sequentially with the ALTER TABLE
          await fieldMetadataRepository.update(booleanField.id, {
            defaultValue: false,
          });

          const fieldName = booleanField.name;
          const tableName = computeObjectTargetTable(booleanField.object);

          await workspaceQueryRunner.query(
            `ALTER TABLE "${dataSourceMetadata.schema}"."${tableName}" ALTER COLUMN "${fieldName}" SET DEFAULT false;`,
          );
        }

        await workspaceQueryRunner.commitTransaction();
        await metadataQueryRunner.commitTransaction();
      } catch (error) {
        await workspaceQueryRunner.rollbackTransaction();
        await metadataQueryRunner.rollbackTransaction();
        this.logger.log(
          chalk.red(`Running command on workspace ${workspaceId} failed`),
        );
        throw error;
      } finally {
        await workspaceQueryRunner.release();
        await metadataQueryRunner.release();
      }

      await this.workspaceCacheVersionService.incrementVersion(workspaceId);

      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
