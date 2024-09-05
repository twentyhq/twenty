import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { QueryRunner, Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { ViewService } from 'src/modules/view/services/view.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

interface MigrateEmailFieldsToEmailsCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.24:migrate-email-fields-to-emails',
  description: 'Migrating fields of deprecated type EMAIL to type EMAILS',
})
export class MigrateEmailFieldsToEmailsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly viewService: ViewService,
  ) {
    super(workspaceRepository);
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active workspaces if not provided',
    required: false,
  })
  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: MigrateEmailFieldsToEmailsCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate email type fields to emails type',
    );
    const _workspaceIds = options.workspaceId
      ? [options.workspaceId]
      : workspaceIds;

    for (const workspaceId of _workspaceIds) {
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

        const fieldsWithEmailType = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.EMAIL,
          },
        });

        for (const fieldWithEmailType of fieldsWithEmailType) {
          const objectMetadata = await this.objectMetadataRepository.findOne({
            where: { id: fieldWithEmailType.objectMetadataId },
          });

          if (!objectMetadata) {
            throw new Error(
              `Could not find objectMetadata for field ${fieldWithEmailType.name}`,
            );
          }

          this.logger.log(
            `Attempting to migrate field ${fieldWithEmailType.name} on ${objectMetadata.nameSingular}.`,
          );
          const workspaceQueryRunner = workspaceDataSource.createQueryRunner();

          await workspaceQueryRunner.connect();

          const fieldName = fieldWithEmailType.name;
          const { id: _id, ...fieldWithEmailTypeWithoutId } =
            fieldWithEmailType;

          const emailDefaultValue = fieldWithEmailTypeWithoutId.defaultValue;

          const defaultValueForEmailsField = {
            primaryEmail: emailDefaultValue,
            additionalEmails: null,
          };

          try {
            const tmpNewEmailsField = await this.fieldMetadataService.createOne(
              {
                ...fieldWithEmailTypeWithoutId,
                type: FieldMetadataType.EMAILS,
                defaultValue: defaultValueForEmailsField,
                name: `${fieldName}Tmp`,
              } satisfies CreateFieldInput,
            );

            const tableName = computeTableName(
              objectMetadata.nameSingular,
              objectMetadata.isCustom,
            );

            // Migrate data from email to emails.primaryEmail
            await this.migrateDataWithinTable({
              sourceColumnName: `${fieldWithEmailType.name}`,
              targetColumnName: `${tmpNewEmailsField.name}PrimaryEmail`,
              tableName,
              workspaceQueryRunner,
              dataSourceMetadata,
            });

            // Duplicate email field's views behaviour for new emails field
            await this.viewService.removeFieldFromViews({
              workspaceId: workspaceId,
              fieldId: tmpNewEmailsField.id,
            });

            const viewFieldRepository =
              await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
                workspaceId,
                'viewField',
              );
            const viewFieldsWithDeprecatedField =
              await viewFieldRepository.find({
                where: {
                  fieldMetadataId: fieldWithEmailType.id,
                  isVisible: true,
                },
              });

            await this.viewService.addFieldToViews({
              workspaceId: workspaceId,
              fieldId: tmpNewEmailsField.id,
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

            // Delete email field
            await this.fieldMetadataService.deleteOneField(
              { id: fieldWithEmailType.id },
              workspaceId,
            );

            // Rename temporary emails field
            await this.fieldMetadataService.updateOne(tmpNewEmailsField.id, {
              id: tmpNewEmailsField.id,
              workspaceId: tmpNewEmailsField.workspaceId,
              name: `${fieldName}`,
              isCustom: false,
            });

            this.logger.log(
              `Migration of ${fieldWithEmailType.name} on ${objectMetadata.nameSingular} done!`,
            );
          } catch (error) {
            this.logger.log(
              `Failed to migrate field ${fieldWithEmailType.name} on ${objectMetadata.nameSingular}, rolling back.`,
            );

            // Re-create initial field if it was deleted
            const initialField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithEmailType.name}`,
                    objectMetadataId: fieldWithEmailType.objectMetadataId,
                  },
                },
              );

            const tmpNewEmailsField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithEmailType.name}Tmp`,
                    objectMetadataId: fieldWithEmailType.objectMetadataId,
                  },
                },
              );

            if (!initialField) {
              this.logger.log(
                `Re-creating initial Email field ${fieldWithEmailType.name} but of type emails`, // Cannot create email fields anymore
              );
              const restoredField = await this.fieldMetadataService.createOne({
                ...fieldWithEmailType,
                defaultValue: defaultValueForEmailsField,
                type: FieldMetadataType.EMAILS,
              });
              const tableName = computeTableName(
                objectMetadata.nameSingular,
                objectMetadata.isCustom,
              );

              if (tmpNewEmailsField) {
                this.logger.log(
                  `Restoring data in field ${fieldWithEmailType.name}`,
                );
                await this.migrateDataWithinTable({
                  sourceColumnName: `${tmpNewEmailsField.name}PrimaryEmail`,
                  targetColumnName: `${restoredField.name}PrimaryEmail`,
                  tableName,
                  workspaceQueryRunner,
                  dataSourceMetadata,
                });
              } else {
                this.logger.log(
                  `Failed to restore data in link field ${fieldWithEmailType.name}`,
                );
              }
            }

            if (tmpNewEmailsField) {
              await this.fieldMetadataService.deleteOneField(
                { id: tmpNewEmailsField.id },
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
