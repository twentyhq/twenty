import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { QueryRunner, Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';

interface MigrateLinkFieldsToLinksCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.23:migrate-link-fields-to-links',
  description: 'Adding new field Address to views containing old address field',
})
export class MigrateLinkFieldsToLinksCommand extends CommandRunner {
  private readonly logger = new Logger(MigrateLinkFieldsToLinksCommand.name);
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceStatusService: WorkspaceStatusService,
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
    options: MigrateLinkFieldsToLinksCommandOptions,
  ): Promise<void> {
    this.logger.log('running');
    let workspaceIds: string[] = [];

    if (options.workspaceId) {
      workspaceIds = [options.workspaceId];
    } else {
      const activeWorkspaceIds =
        await this.workspaceStatusService.getActiveWorkspaceIds();

      workspaceIds = activeWorkspaceIds;
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
      this.logger.log(`Running command for workspace ${workspaceId}`);
      try {
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

        const fieldsWithLinkType = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.LINK,
          },
        });

        for (const fieldWithLinkType of fieldsWithLinkType) {
          const objectMetadata = await this.objectMetadataRepository.findOne({
            where: { id: fieldWithLinkType.objectMetadataId },
          });

          if (!objectMetadata) {
            throw new Error(
              `Could not find objectMetadata for field ${fieldWithLinkType.name}`,
            );
          }

          this.logger.log(
            `Attempting to migrate field ${fieldWithLinkType.name} on ${objectMetadata.nameSingular}.`,
          );
          const workspaceQueryRunner = workspaceDataSource.createQueryRunner();

          await workspaceQueryRunner.connect();
          await workspaceQueryRunner.startTransaction();
          try {
            //   const fieldIsStandard = fieldWithLinkType.isCustom === false;
            const fieldName = fieldWithLinkType.name;
            const { id: _id, ...fieldWithLinkTypeWithoutId } =
              fieldWithLinkType;
            const tmpNewLinksField = await this.fieldMetadataService.createOne({
              ...fieldWithLinkTypeWithoutId,
              type: FieldMetadataType.LINKS,
              defaultValue: null,
              name: `${fieldName}Tmp`,
            } satisfies CreateFieldInput);

            const tableName = computeTableName(
              objectMetadata.nameSingular,
              objectMetadata.isCustom,
            );

            // Migrate from linkLabel to primaryLinkLabel
            await this.migrateData({
              sourceFieldName: `${fieldWithLinkType.name}Label`,
              targetFieldName: `${tmpNewLinksField.name}PrimaryLinkLabel`,
              tableName,
              workspaceQueryRunner,
              dataSourceMetadata,
            });

            // Migrate from linkUrl to primaryLinkUrl
            await this.migrateData({
              sourceFieldName: `${fieldWithLinkType.name}Url`,
              targetFieldName: `${tmpNewLinksField.name}PrimaryLinkUrl`,
              tableName,
              workspaceQueryRunner,
              dataSourceMetadata,
            });

            // Problem: we dont support deletion of composite fields..
            await this.fieldMetadataService.deleteOneField(
              { id: fieldWithLinkType.id },
              workspaceId,
            );

            this.fieldMetadataService.createOne({
              ...tmpNewLinksField,
              name: `${fieldName}`,
            });

            this.logger.log(
              `Migration of ${fieldWithLinkType.name} on ${objectMetadata.nameSingular} done!`,
            );

            // TODO handle views
          } catch (error) {
            this.logger.log(
              `Failed to migrate field ${fieldWithLinkType.name} on ${objectMetadata.nameSingular}, rolling back.`,
            );
            await workspaceQueryRunner.rollbackTransaction();
            const tmpNewLinksField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithLinkType}Tmp`,
                    objectMetadataId: fieldWithLinkType.objectMetadataId,
                  },
                },
              );

            if (tmpNewLinksField) {
              // Problem: we dont support deletion of composite fields..
              await this.fieldMetadataService.deleteOneField(
                { id: tmpNewLinksField.id },
                workspaceId,
              );
            }
          }
        }
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}`,
          ),
        );
        continue;
      }

      this.logger.log(chalk.green(`Command completed!`));
    }
  }

  private async migrateData({
    sourceFieldName,
    targetFieldName,
    tableName,
    workspaceQueryRunner,
    dataSourceMetadata,
  }: {
    sourceFieldName: string;
    targetFieldName: string;
    tableName: string;
    workspaceQueryRunner: QueryRunner;
    dataSourceMetadata: DataSourceEntity;
  }) {
    await workspaceQueryRunner.query(
      `UPDATE "${dataSourceMetadata.schema}"."${tableName}" SET "${targetFieldName}" = "${sourceFieldName}"`,
    );
  }

  private async getWorkspaceDataSource({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
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

    return workspaceDataSource;
  }
}
