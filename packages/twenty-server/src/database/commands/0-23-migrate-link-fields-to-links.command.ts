import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

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
    private readonly fieldMetadataService: FieldMetadataService,
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
    options: MigrateLinkFieldsToLinksCommandOptions,
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
        const fieldsWithLinkType = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.LINK,
          },
        });

        for (const fieldWithLinkType of fieldsWithLinkType) {
          //   const fieldIsStandard = fieldWithLinkType.isCustom === false;
          const fieldName = fieldWithLinkType.name;
          const tmpNewLinksField = await this.fieldMetadataService.createOne({
            ...fieldWithLinkType,
            type: FieldMetadataType.LINKS,
            name: `${fieldName}_tmp`,
          } satisfies CreateFieldInput);

          // Migrate from linkLabel to primaryLinkLabel
          this.migrateData({
            oldFieldName: fieldWithLinkType,
            newFieldName: tmpNewLinksField,
          });

          // Migrate from linkUrl to primaryLinkUrl
          this.migrateData({
            oldFieldName: fieldWithLinkType,
            newFieldName: tmpNewLinksField,
          });

          // what about the views ??
          await this.fieldMetadataService.deleteOneField(
            { id: fieldWithLinkType.id },
            workspaceId,
          );

          const newLinksField = await this.fieldMetadataService.createOne({
            ...tmpNewLinksField,
            name: `${fieldName}`,
          });
        }

        //   if (fieldIsStandard) {
        //     createTmpNewStandardFieldLinks();
        //     migrateData();
        //     deleteOldStandardField();
        //     renameNewStandardField();
        //   }
        // }
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

  async migrateData({
    sourceFieldName,
    targetFieldName,
    tableName,
  }: {
    sourceFieldName: string;
    targetFieldName: string;
    tableName: string;
  }) {
    await this.workspaceQueryRunner.query(
      `UPDATE "${dataSourceMetadata.schema}"."${tableName}" SET "${targetFieldName}" = "${sourceFieldName}"`,
    );
  }
}
