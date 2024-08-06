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
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewService } from 'src/modules/view/services/view.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

interface MigrateDomainNameFromTextToLinksCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23:migrate-domain-standard-field-to-links',
  description:
    'Migrating field domainName of deprecated type TEXT to type LINKS',
})
export class MigrateDomainNameFromTextToLinksCommand extends CommandRunner {
  private readonly logger = new Logger(
    MigrateDomainNameFromTextToLinksCommand.name,
  );
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
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
    options: MigrateDomainNameFromTextToLinksCommandOptions,
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate standard field domainName from text to Link',
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

        const domainNameField = await this.fieldMetadataRepository.findOneBy({
          workspaceId,
          standardId: COMPANY_STANDARD_FIELD_IDS.domainName,
        });

        if (!domainNameField) {
          throw new Error('Could not find domainName field');
        }

        if (domainNameField.type === FieldMetadataType.LINKS) {
          this.logger.log(
            `Field domainName is already of type LINKS, skipping migration.`,
          );
          continue;
        }

        this.logger.log(`Attempting to migrate domainName field.`);

        const workspaceQueryRunner = workspaceDataSource.createQueryRunner();

        await workspaceQueryRunner.connect();

        const fieldName = domainNameField.name;
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...domainNameFieldWithoutIdAndTimestamps
        } = domainNameField;

        try {
          const tmpNewDomainLinksField =
            await this.fieldMetadataService.createOne({
              ...domainNameFieldWithoutIdAndTimestamps,
              type: FieldMetadataType.LINKS,
              name: `${fieldName}Tmp`,
              defaultValue: {
                primaryLinkUrl: domainNameField.defaultValue,
                secondaryLinks: null,
                primaryLinkLabel: "''",
              },
            } satisfies CreateFieldInput);

          // Migrate data from domainName to primaryLinkUrl
          await this.migrateDataWithinCompanyTable({
            sourceColumnName: `${domainNameField.name}`,
            targetColumnName: `${tmpNewDomainLinksField.name}PrimaryLinkUrl`,
            workspaceQueryRunner,
            dataSourceMetadata,
          });

          // Duplicate initial domainName text field's views behaviour for new domainName field
          await this.viewService.removeFieldFromViews({
            workspaceId: workspaceId,
            fieldId: tmpNewDomainLinksField.id,
          });

          const viewFieldRepository =
            await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
              workspaceId,
              'viewField',
            );
          const viewFieldsWithDeprecatedField = await viewFieldRepository.find({
            where: {
              fieldMetadataId: domainNameField.id,
              isVisible: true,
            },
          });

          await this.viewService.addFieldToViews({
            workspaceId: workspaceId,
            fieldId: tmpNewDomainLinksField.id,
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
            size: 150,
          });

          // Delete initial domainName text field
          await this.fieldMetadataService.deleteOneField(
            { id: domainNameField.id },
            workspaceId,
          );

          // Rename temporary domainName links field
          await this.fieldMetadataService.updateOne(tmpNewDomainLinksField.id, {
            id: tmpNewDomainLinksField.id,
            workspaceId: tmpNewDomainLinksField.workspaceId,
            name: `${fieldName}`,
            isCustom: false,
          });

          this.logger.log(`Migration of domainName done!`);
        } catch (error) {
          this.logger.log(`Error: ${error.message}`);
          this.logger.log(
            `Failed to migrate domainName ${domainNameField.id}, rolling back.`,
          );

          // Re-create initial field if it was deleted
          const initialField =
            await this.fieldMetadataService.findOneWithinWorkspace(
              workspaceId,
              {
                where: {
                  name: `${domainNameField.name}`,
                  objectMetadataId: domainNameField.objectMetadataId,
                },
              },
            );

          const tmpNewDomainLinksField =
            await this.fieldMetadataService.findOneWithinWorkspace(
              workspaceId,
              {
                where: {
                  name: `${domainNameField.name}Tmp`,
                  objectMetadataId: domainNameField.objectMetadataId,
                },
              },
            );

          if (!initialField) {
            this.logger.log(`Re-creating initial domainName field`);
            const restoredField = await this.fieldMetadataService.createOne({
              ...domainNameField,
            });

            if (tmpNewDomainLinksField) {
              this.logger.log(`Restoring data in domainName`);
              await this.migrateDataWithinCompanyTable({
                sourceColumnName: `${tmpNewDomainLinksField.name}PrimaryLinkLabel`,
                targetColumnName: `${restoredField.name}PrimaryLinkLabel`,
                workspaceQueryRunner,
                dataSourceMetadata,
              });

              await this.migrateDataWithinCompanyTable({
                sourceColumnName: `${tmpNewDomainLinksField.name}PrimaryLinkUrl`,
                targetColumnName: `${restoredField.name}PrimaryLinkUrl`,
                workspaceQueryRunner,
                dataSourceMetadata,
              });
            } else {
              this.logger.log(
                `Failed to restore data in domainName field ${domainNameField.id}`,
              );
            }
          }

          if (tmpNewDomainLinksField) {
            await this.fieldMetadataService.deleteOneField(
              { id: tmpNewDomainLinksField.id },
              workspaceId,
            );
          }
        } finally {
          await workspaceQueryRunner.release();
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

  private async migrateDataWithinCompanyTable({
    sourceColumnName,
    targetColumnName,
    workspaceQueryRunner,
    dataSourceMetadata,
  }: {
    sourceColumnName: string;
    targetColumnName: string;
    workspaceQueryRunner: QueryRunner;
    dataSourceMetadata: DataSourceEntity;
  }) {
    await workspaceQueryRunner.query(
      `UPDATE "${dataSourceMetadata.schema}"."company" SET "${targetColumnName}" = CASE WHEN "${sourceColumnName}" IS NULL OR "${sourceColumnName}" = '' THEN "${sourceColumnName}" WHEN "${sourceColumnName}" LIKE 'http%' THEN "${sourceColumnName}" ELSE 'https://' || "${sourceColumnName}" END;`,
    );
  }
}
