import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';
import chalk from 'chalk';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
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
    let workspaceIds: string[] = [];

    if (options.workspaceId) {
      workspaceIds = [options.workspaceId];
    } else {
      workspaceIds = (await this.workspaceRepository.find()).map(
        (workspace) => workspace.id,
      );
    }

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    } else {
      this.logger.log(
        chalk.green(`Running command on ${workspaceIds.length} workspaces`),
      );
    }

    for (const workspaceId of workspaceIds) {
      const dataSourceMetadatas =
        await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
          workspaceId,
        );

      for (const dataSourceMetadata of dataSourceMetadatas) {
        const workspaceDataSource =
          await this.typeORMService.connectToDataSource(dataSourceMetadata);

        if (workspaceDataSource) {
          const queryRunner = workspaceDataSource.createQueryRunner();

          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            const booleanFields = await this.fieldMetadataRepository.findBy({
              workspaceId,
              type: FieldMetadataType.BOOLEAN,
            });

            for (const booleanField of booleanFields) {
              if (booleanField.defaultValue === null) {
                await this.fieldMetadataRepository.update(booleanField.id, {
                  defaultValue: false,
                });
              }

              const objectMetadataItemForField =
                await this.objectMetadataRepository.findOneBy({
                  id: booleanField.objectMetadataId,
                });

              if (!objectMetadataItemForField) {
                throw new Error(
                  `Could not find objectMetadataItem for field ${booleanField.id}`,
                );
              }

              const fieldName = booleanField.name;
              const tableName = computeObjectTargetTable(
                objectMetadataItemForField,
              );

              await queryRunner.query(
                `UPDATE "${dataSourceMetadata.schema}"."${tableName}" SET "${fieldName}" = 'false' WHERE "${fieldName}" IS NULL`,
              );
            }

            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.log(
              chalk.red(`Running command on workspace ${workspaceId} failed`),
            );
            throw error;
          } finally {
            await queryRunner.release();
          }
        }
      }

      await this.workspaceCacheVersionService.incrementVersion(workspaceId);

      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
