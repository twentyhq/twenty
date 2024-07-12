import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import isEmpty from 'lodash.isempty';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

interface AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.22:add-new-address-field-to-views-with-deprecated-address-field',
  description: 'Adding new field Address to views containing old address field',
})
export class AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand extends CommandRunner {
  private readonly logger = new Logger(
    AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand.name,
  );
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly twentyORMManager: TwentyORMManager,
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
    options: AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommandOptions,
  ): Promise<void> {
    // This command can be generic-ified turning the below consts in options
    const deprecatedFieldStandardId =
      COMPANY_STANDARD_FIELD_IDS.address_deprecated;
    const newFieldStandardId = COMPANY_STANDARD_FIELD_IDS.address;

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
        const viewFieldRepository =
          await this.twentyORMManager.getRepositoryForWorkspace(
            workspaceId,
            ViewFieldWorkspaceEntity,
          );

        const dataSourceMetadatas =
          await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
            workspaceId,
          );

        for (const dataSourceMetadata of dataSourceMetadatas) {
          const workspaceDataSource =
            await this.typeORMService.connectToDataSource(dataSourceMetadata);

          if (workspaceDataSource) {
            const newAddressField = await this.fieldMetadataRepository.findBy({
              workspaceId,
              standardId: newFieldStandardId,
            });

            if (isEmpty(newAddressField)) {
              this.logger.log(
                `Error - missing new Address standard field of type Address, please run workspace-sync-metadata on your workspace (${workspaceId}) before running this command`,
              );
              continue;
            }

            const addressDeprecatedField =
              await this.fieldMetadataRepository.findOneBy({
                workspaceId,
                standardId: deprecatedFieldStandardId,
              });

            if (isEmpty(addressDeprecatedField)) {
              continue;
            }

            const viewsWithAddressDeprecatedField =
              await viewFieldRepository.find({
                where: {
                  fieldMetadataId: addressDeprecatedField.id,
                  isVisible: true,
                },
              });

            for (const viewWithAddressDeprecatedField of viewsWithAddressDeprecatedField) {
              const viewId = viewWithAddressDeprecatedField.viewId;

              const newAddressFieldInThisView =
                await viewFieldRepository.findBy({
                  fieldMetadataId: newAddressField[0].id,
                  viewId: viewWithAddressDeprecatedField.viewId as string,
                  isVisible: true,
                });

              if (!isEmpty(newAddressFieldInThisView)) {
                continue;
              }

              this.logger.log(
                `Adding new address field to view ${viewId} for workspace ${workspaceId}...`,
              );
              const newViewField = viewFieldRepository.create({
                viewId: viewWithAddressDeprecatedField.viewId,
                fieldMetadataId: newAddressField[0].id,
                position: viewWithAddressDeprecatedField.position - 0.5,
                isVisible: true,
              });

              await viewFieldRepository.save(newViewField);
              this.logger.log(
                `New address field successfully added to view ${viewId} for workspace ${workspaceId}`,
              );
            }
          }
        }

        await this.workspaceCacheVersionService.incrementVersion(workspaceId);

        this.logger.log(
          chalk.green(`Running command on workspace ${workspaceId} done`),
        );
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
}
