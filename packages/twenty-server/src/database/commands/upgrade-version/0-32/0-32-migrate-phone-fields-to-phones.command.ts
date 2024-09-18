import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { Command } from 'nest-commander';
import { QueryRunner, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataDefaultValuePhones } from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { PERSON_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewService } from 'src/modules/view/services/view.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

type MigratePhoneFieldsToPhonesCommandOptions = ActiveWorkspacesCommandOptions;
@Command({
  name: 'upgrade-0.32:migrate-phone-fields-to-phones',
  description: 'Migrating fields of deprecated type PHONE to type PHONES',
})
export class MigratePhoneFieldsToPhonesCommand extends ActiveWorkspacesCommandRunner {
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

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: MigratePhoneFieldsToPhonesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate phone type fields to phones type',
    );

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
        const phoneFieldWithTextType =
          await this.fieldMetadataRepository.findOneBy({
            workspaceId,
            standardId: PERSON_STANDARD_FIELD_IDS.phone,
          });

        const fieldsWithPhoneType = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.PHONE,
          },
        });

        const fieldsWithPhoneData = [
          ...fieldsWithPhoneType,
          phoneFieldWithTextType,
        ];

        for (const fieldWithPhoneData of fieldsWithPhoneData) {
          if (!fieldWithPhoneData) return;
          const objectMetadata = await this.objectMetadataRepository.findOne({
            where: { id: fieldWithPhoneData.objectMetadataId },
          });

          if (!objectMetadata) {
            throw new Error(
              `Could not find objectMetadata for field ${fieldWithPhoneData.name}`,
            );
          }
          this.logger.log(
            `Attempting to migrate field ${fieldWithPhoneData.name} on ${objectMetadata.nameSingular}.`,
          );
          const workspaceQueryRunner = workspaceDataSource.createQueryRunner();

          await workspaceQueryRunner.connect();
          const fieldName = fieldWithPhoneData.name;
          const { id: _id, ...fieldWithPhoneDataWithoutId } =
            fieldWithPhoneData;
          const phoneDefaultValue = fieldWithPhoneDataWithoutId.defaultValue;
          let parsedPhoneDefaultValue: PhoneNumber | null = null;
          let defaultValueForPhonesField: FieldMetadataDefaultValuePhones | null =
            null;

          if (phoneDefaultValue) {
            try {
              parsedPhoneDefaultValue = parsePhoneNumber(
                phoneDefaultValue as string,
              );
              defaultValueForPhonesField = {
                primaryPhoneCountryCode: `+${parsedPhoneDefaultValue.countryCallingCode}`,
                primaryPhoneNumber: parsedPhoneDefaultValue.nationalNumber,
                additionalPhones: null,
              };
            } catch (error) {
              this.logger.log('Falied to parse phone number');
            }
          }

          try {
            const tmpNewPhonesField = await this.fieldMetadataService.createOne(
              {
                ...fieldWithPhoneDataWithoutId,
                type: FieldMetadataType.PHONES,
                defaultValue: defaultValueForPhonesField,
                name: `${fieldName}Tmp`,
              } satisfies CreateFieldInput,
            );

            const tableName = computeTableName(
              objectMetadata.nameSingular,
              objectMetadata.isCustom,
            );

            // Migrate phone data from Phone|Text type to Phones type
            await this.migratePhoneData({
              phoneFieldName: fieldWithPhoneData.name,
              tableName,
              workspaceQueryRunner,
              dataSourceMetadata,
            });

            // Duplicate phone field's views behaviour for new phones field
            await this.viewService.removeFieldFromViews({
              workspaceId: workspaceId,
              fieldId: tmpNewPhonesField.id,
            });
            const viewFieldRepository =
              await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
                workspaceId,
                'viewField',
              );
            const viewFieldsWithDeprecatedField =
              await viewFieldRepository.find({
                where: {
                  fieldMetadataId: fieldWithPhoneData.id,
                  isVisible: true,
                },
              });

            await this.viewService.addFieldToViews({
              workspaceId: workspaceId,
              fieldId: tmpNewPhonesField.id,
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
            // Delete phone field
            await this.fieldMetadataService.deleteOneField(
              { id: fieldWithPhoneData.id },
              workspaceId,
            );
            // Rename temporary phones field
            await this.fieldMetadataService.updateOne(tmpNewPhonesField.id, {
              id: tmpNewPhonesField.id,
              workspaceId: tmpNewPhonesField.workspaceId,
              name: `${fieldName}`,
              isCustom: tmpNewPhonesField.isCustom,
            });
            this.logger.log(
              `Migration of ${fieldWithPhoneData.name} on ${objectMetadata.nameSingular} done!`,
            );
          } catch (error) {
            this.logger.log(
              `Failed to migrate field ${fieldWithPhoneData.name} on ${objectMetadata.nameSingular}, rolling back.`,
            );
            // Re-create initial field if it was deleted
            const initialField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithPhoneData.name}`,
                    objectMetadataId: fieldWithPhoneData.objectMetadataId,
                  },
                },
              );
            const tmpNewPhonesField =
              await this.fieldMetadataService.findOneWithinWorkspace(
                workspaceId,
                {
                  where: {
                    name: `${fieldWithPhoneData.name}Tmp`,
                    objectMetadataId: fieldWithPhoneData.objectMetadataId,
                  },
                },
              );

            if (!initialField) {
              this.logger.log(
                `Re-creating initial Phone field ${fieldWithPhoneData.name} but of type phones`, // Cannot create phone fields anymore
              );
              const restoredField = await this.fieldMetadataService.createOne({
                ...fieldWithPhoneData,
                defaultValue: defaultValueForPhonesField,
                type: FieldMetadataType.PHONES,
              });
              const tableName = computeTableName(
                objectMetadata.nameSingular,
                objectMetadata.isCustom,
              );

              if (tmpNewPhonesField) {
                this.logger.log(
                  `Restoring data in field ${fieldWithPhoneData.name}`,
                );
                await this.migrateDataWithinTable({
                  sourceColumnName: `${tmpNewPhonesField.name}PrimaryPhoneNumber`,
                  targetColumnName: `${restoredField.name}PrimaryPhoneNumber`,
                  tableName,
                  workspaceQueryRunner,
                  dataSourceMetadata,
                });
                await this.migrateDataWithinTable({
                  sourceColumnName: `${tmpNewPhonesField.name}PrimaryCountryCode`,
                  targetColumnName: `${restoredField.name}PrimaryCountryCode`,
                  tableName,
                  workspaceQueryRunner,
                  dataSourceMetadata,
                });
              } else {
                this.logger.log(
                  `Failed to restore data in link field ${fieldWithPhoneData.name}`,
                );
              }
            }
            if (tmpNewPhonesField) {
              await this.fieldMetadataService.deleteOneField(
                { id: tmpNewPhonesField.id },
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

  private async getPhoneRecords({
    phoneFieldName,
    tableName,
    workspaceQueryRunner,
    dataSourceMetadata,
  }: {
    phoneFieldName: string;
    tableName: string;
    workspaceQueryRunner: QueryRunner;
    dataSourceMetadata: DataSourceEntity;
  }) {
    return await workspaceQueryRunner.query(
      `SELECT id,"${phoneFieldName}" FROM "${dataSourceMetadata.schema}"."${tableName}" WHERE 
      "${phoneFieldName}" IS NOT null`,
    );
  }

  private async migratePhoneData({
    phoneFieldName,
    tableName,
    workspaceQueryRunner,
    dataSourceMetadata,
  }: {
    phoneFieldName: string;
    tableName: string;
    workspaceQueryRunner: QueryRunner;
    dataSourceMetadata: DataSourceEntity;
  }) {
    const phoneRecords = await this.getPhoneRecords({
      phoneFieldName,
      tableName,
      workspaceQueryRunner,
      dataSourceMetadata,
    });

    for (const record of phoneRecords) {
      const phoneColumnValue = record[phoneFieldName];

      const query = `UPDATE "${dataSourceMetadata.schema}"."${tableName}" SET "${phoneFieldName}TmpPrimaryPhoneCountryCode" = $1,"${phoneFieldName}TmpPrimaryPhoneNumber" = $2 where "id"=$3`;

      try {
        const parsedPhoneColumnValue = parsePhoneNumber(phoneColumnValue);

        await workspaceQueryRunner.query(query, [
          `+${parsedPhoneColumnValue.countryCallingCode}`,
          parsedPhoneColumnValue.nationalNumber,
          record.id,
        ]);
      } catch (error) {
        // Store the invalid string for invalid phone numbers

        await workspaceQueryRunner.query(query, [
          '',
          phoneColumnValue,
          record.id,
        ]);
      }
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
