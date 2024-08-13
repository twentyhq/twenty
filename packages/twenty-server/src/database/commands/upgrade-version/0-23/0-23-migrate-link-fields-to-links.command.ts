import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { QueryRunner, Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataDefaultValueLink } from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { ViewService } from 'src/modules/view/services/view.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

interface MigrateLinkFieldsToLinksCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23:migrate-link-fields-to-links',
  description: 'Migrating fields of deprecated type LINK to type LINKS',
})
export class MigrateLinkFieldsToLinksCommand extends CommandRunner {
  private readonly logger = new Logger(MigrateLinkFieldsToLinksCommand.name);
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceStatusService: WorkspaceStatusService,
    private readonly viewService: ViewService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: MigrateLinkFieldsToLinksCommandOptions,
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate link type fields to links type',
    );
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

          const fieldName = fieldWithLinkType.name;
          const { id: _id, ...fieldWithLinkTypeWithoutId } = fieldWithLinkType;

          const linkDefaultValue =
            fieldWithLinkTypeWithoutId.defaultValue as FieldMetadataDefaultValueLink;

          const defaultValueForLinksField = {
            primaryLinkUrl: linkDefaultValue.url,
            primaryLinkLabel: linkDefaultValue.label,
            secondaryLinks: null,
          };

          try {
            const tmpNewLinksField = await this.fieldMetadataService.createOne({
              ...fieldWithLinkTypeWithoutId,
              type: FieldMetadataType.LINKS,
              defaultValue: defaultValueForLinksField,
              name: `${fieldName}Tmp`,
            } satisfies CreateFieldInput);

            const tableName = computeTableName(
              objectMetadata.nameSingular,
              objectMetadata.isCustom,
            );

            // Migrate data from linkLabel to primaryLinkLabel
            await this.migrateDataWithinTable({
              sourceColumnName: `${fieldWithLinkType.name}Label`,
              targetColumnName: `${tmpNewLinksField.name}PrimaryLinkLabel`,
              tableName,
              workspaceQueryRunner,
              dataSourceMetadata,
            });

            // Migrate data from linkUrl to primaryLinkUrl
            await this.migrateDataWithinTable({
              sourceColumnName: `${fieldWithLinkType.name}Url`,
              targetColumnName: `${tmpNewLinksField.name}PrimaryLinkUrl`,
              tableName,
              workspaceQueryRunner,
              dataSourceMetadata,
            });

            // Duplicate link field's views behaviour for new links field
            await this.viewService.removeFieldFromViews({
              workspaceId: workspaceId,
              fieldId: tmpNewLinksField.id,
            });

            const viewFieldRepository =
              await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
                workspaceId,
                'viewField',
              );
            const viewFieldsWithDeprecatedField =
              await viewFieldRepository.find({
                where: {
                  fieldMetadataId: fieldWithLinkType.id,
                  isVisible: true,
                },
              });

            await this.viewService.addFieldToViews({
              workspaceId: workspaceId,
              fieldId: tmpNewLinksField.id,
              viewsIds: viewFieldsWithDeprecatedField
                .filter((viewField) => viewField.viewId !== null)
                .map((viewField) => viewField.viewId as string),
              positions: viewFieldsWithDeprecatedField.reduce(
                (acc, viewField) => {
                  if (!viewField.viewId) {
                    return acc;
                  }
                  acc[viewField.viewId] = viewField.position;

                  return acc;
                },
                [],
              ),
            });

            // Delete link field
            await this.fieldMetadataService.deleteOneField(
              { id: fieldWithLinkType.id },
              workspaceId,
            );

            // Rename temporary links field
            await this.fieldMetadataService.updateOne(tmpNewLinksField.id, {
              id: tmpNewLinksField.id,
              workspaceId: tmpNewLinksField.workspaceId,
              name: `${fieldName}`,
              isCustom: false,
            });

            this.logger.log(
              `Migration of ${fieldWithLinkType.name} on ${objectMetadata.nameSingular} done!`,
            );
          } catch (error) {
            this.logger.log(
              `Failed to migrate field ${fieldWithLinkType.name} on ${objectMetadata.nameSingular}, rolling back.`,
            );

            // Re-create initial field if it was deleted
            const initialField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithLinkType.name}`,
                    objectMetadataId: fieldWithLinkType.objectMetadataId,
                  },
                },
              );

            const tmpNewLinksField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithLinkType.name}Tmp`,
                    objectMetadataId: fieldWithLinkType.objectMetadataId,
                  },
                },
              );

            if (!initialField) {
              this.logger.log(
                `Re-creating initial link field ${fieldWithLinkType.name} but of type links`, // Cannot create link fields anymore
              );
              const restoredField = await this.fieldMetadataService.createOne({
                ...fieldWithLinkType,
                defaultValue: defaultValueForLinksField,
                type: FieldMetadataType.LINKS,
              });
              const tableName = computeTableName(
                objectMetadata.nameSingular,
                objectMetadata.isCustom,
              );

              if (tmpNewLinksField) {
                this.logger.log(
                  `Restoring data in field ${fieldWithLinkType.name}`,
                );
                await this.migrateDataWithinTable({
                  sourceColumnName: `${tmpNewLinksField.name}PrimaryLinkLabel`,
                  targetColumnName: `${restoredField.name}PrimaryLinkLabel`,
                  tableName,
                  workspaceQueryRunner,
                  dataSourceMetadata,
                });

                await this.migrateDataWithinTable({
                  sourceColumnName: `${tmpNewLinksField.name}PrimaryLinkUrl`,
                  targetColumnName: `${restoredField.name}PrimaryLinkUrl`,
                  tableName,
                  workspaceQueryRunner,
                  dataSourceMetadata,
                });
              } else {
                this.logger.log(
                  `Failed to restore data in link field ${fieldWithLinkType.name}`,
                );
              }
            }

            if (tmpNewLinksField) {
              await this.fieldMetadataService.deleteOneField(
                { id: tmpNewLinksField.id },
                workspaceId,
              );
            }
          } finally {
            await workspaceQueryRunner.release();
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

  private async migrateDataWithinTable({
    sourceColumnName,
    targetColumnName,
    tableName,
    workspaceQueryRunner,
    dataSourceMetadata,
  }: {
    sourceColumnName: string;
    targetColumnName: string;
    tableName: string;
    workspaceQueryRunner: QueryRunner;
    dataSourceMetadata: DataSourceEntity;
  }) {
    await workspaceQueryRunner.query(
      `UPDATE "${dataSourceMetadata.schema}"."${tableName}" SET "${targetColumnName}" = "${sourceColumnName}"`,
    );
  }
}
