import { InjectRepository } from '@nestjs/typeorm';

import { ServerBlockNoteEditor } from '@blocknote/server-util';
import chalk from 'chalk';
import { FieldMetadataType } from 'twenty-shared';
import { Repository } from 'typeorm';

import { isCommandLogger } from 'src/database/commands/logger';
import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import {
  MaintainedWorkspacesMigrationCommandOptions,
  MaintainedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/migration-command/maintained-workspaces-migration-command.runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

type MigrateRichTextContentArgs = {
  richTextFieldsWithObjectMetadata: RichTextFieldsWithObjectMetadata[];
  workspaceId: string;
};

type RichTextFieldsWithObjectMetadata = {
  richTextField: FieldMetadataEntity;
  objectMetadata: ObjectMetadataEntity | null;
};

type ProcessWorkspaceArgs = {
  workspaceId: string;
  index: number;
  total: number;
};

type ProcessRichTextFieldsArgs = {
  richTextFields: FieldMetadataEntity[];
  workspaceId: string;
};

@MigrationCommand({
  name: 'migrate-rich-text-content-patch',
  description: 'Migrate RICH_TEXT content from v1 to v2',
  version: '0.43',
})
export class MigrateRichTextContentPatchCommand extends MaintainedWorkspacesMigrationCommandRunner<MaintainedWorkspacesMigrationCommandOptions> {
  private options: MaintainedWorkspacesMigrationCommandOptions;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FeatureFlag, 'core')
    protected readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  async runMigrationCommandOnMaintainedWorkspaces(
    _passedParam: string[],
    options: MaintainedWorkspacesMigrationCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate RICH_TEXT contents from v1 to v2',
    );

    this.options = options;
    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    for (const [index, workspaceId] of workspaceIds.entries()) {
      try {
        await this.processWorkspace({
          workspaceId,
          index,
          total: workspaceIds.length,
        });
      } catch (error) {
        this.logger.log(
          chalk.red(`Error in workspace ${workspaceId}: ${error}`),
        );
      }

      await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
        workspaceId,
      );
    }

    this.logger.log(chalk.green('Command completed!'));
  }

  private async processWorkspace({
    index,
    total,
    workspaceId,
  }: ProcessWorkspaceArgs): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      if (await this.hasRichTextV2FeatureFlag(workspaceId)) {
        throw new Error(
          'Rich text v2 feature flag is enabled, skipping migration',
        );
      }

      const richTextFields = await this.fieldMetadataRepository.find({
        where: {
          workspaceId,
          type: FieldMetadataType.RICH_TEXT,
        },
      });

      if (!richTextFields.length) {
        this.logger.log(
          chalk.yellow('No RICH_TEXT fields found in this workspace'),
        );

        return;
      }

      this.logger.log(`Found ${richTextFields.length} RICH_TEXT fields`);

      const richTextFieldsWithObjectMetadata =
        await this.getRichTextFieldsWithObjectMetadata({
          richTextFields,
          workspaceId,
        });

      await this.migrateToNewRichTextFieldsColumn({
        richTextFieldsWithObjectMetadata,
        workspaceId,
      });

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}`),
      );
    } catch (error) {
      this.logger.log(chalk.red(`Error in workspace ${workspaceId}: ${error}`));
    }
  }

  private async hasRichTextV2FeatureFlag(
    workspaceId: string,
  ): Promise<boolean> {
    return await this.featureFlagRepository.exists({
      where: {
        workspaceId,
        key: FeatureFlagKey.IsRichTextV2Enabled,
        value: true,
      },
    });
  }

  private async getRichTextFieldsWithObjectMetadata({
    richTextFields,
    workspaceId,
  }: ProcessRichTextFieldsArgs): Promise<RichTextFieldsWithObjectMetadata[]> {
    const richTextFieldsWithObjectMetadata: RichTextFieldsWithObjectMetadata[] =
      [];

    for (const richTextField of richTextFields) {
      const objectMetadata = await this.objectMetadataRepository.findOne({
        where: { id: richTextField.objectMetadataId },
        relations: {
          fields: true,
        },
      });

      if (objectMetadata === null) {
        this.logger.warn(
          `Object metadata not found for rich text field ${richTextField.name} in workspace ${workspaceId}`,
        );
      }

      richTextFieldsWithObjectMetadata.push({
        richTextField,
        objectMetadata,
      });
    }

    return richTextFieldsWithObjectMetadata;
  }

  private jsonParseOrSilentlyFail(input: string): null | unknown {
    try {
      return JSON.parse(input);
    } catch (e) {
      return null;
    }
  }

  private async getMarkdownFieldValue({
    blocknoteFieldValue,
    serverBlockNoteEditor,
  }: {
    blocknoteFieldValue: string | null;
    serverBlockNoteEditor: ServerBlockNoteEditor;
  }): Promise<string | null> {
    const blocknoteFieldValueIsDefined =
      blocknoteFieldValue !== null &&
      blocknoteFieldValue !== undefined &&
      blocknoteFieldValue !== '{}';

    if (!blocknoteFieldValueIsDefined) {
      return null;
    }

    const jsonParsedblocknoteFieldValue =
      this.jsonParseOrSilentlyFail(blocknoteFieldValue);

    if (jsonParsedblocknoteFieldValue === null) {
      return null;
    }

    if (!Array.isArray(jsonParsedblocknoteFieldValue)) {
      this.logger.warn(
        `blocknoteFieldValue is defined and is not an array got ${blocknoteFieldValue}`,
      );

      return null;
    }

    let markdown: string | null = null;

    try {
      markdown = await serverBlockNoteEditor.blocksToMarkdownLossy(
        jsonParsedblocknoteFieldValue,
      );
    } catch (error) {
      this.logger.warn(
        `Error converting blocknote to markdown for ${blocknoteFieldValue}`,
      );
    }

    return markdown;
  }

  private async migrateToNewRichTextFieldsColumn({
    richTextFieldsWithObjectMetadata,
    workspaceId,
  }: MigrateRichTextContentArgs) {
    const serverBlockNoteEditor = ServerBlockNoteEditor.create();

    for (const {
      richTextField,
      objectMetadata,
    } of richTextFieldsWithObjectMetadata) {
      if (objectMetadata === null) {
        this.logger.log(
          `Object metadata not found for rich text field ${richTextField.name} in workspace ${workspaceId}`,
        );
        continue;
      }

      const schemaName =
        this.workspaceDataSourceService.getSchemaName(workspaceId);

      const workspaceDataSource =
        await this.twentyORMGlobalManager.getDataSourceForWorkspace(
          workspaceId,
        );

      const rows = await workspaceDataSource.query(
        `SELECT id, "${richTextField.name}" FROM "${schemaName}"."${computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom)}" WHERE "${richTextField.name}" IS NOT NULL`,
      );

      this.logger.log(`Generating markdown for ${rows.length} records`);

      for (const row of rows) {
        const blocknoteFieldValue = row[richTextField.name];
        const markdownFieldValue = await this.getMarkdownFieldValue({
          blocknoteFieldValue,
          serverBlockNoteEditor,
        });

        if (!this.options.dryRun) {
          await workspaceDataSource.query(
            `UPDATE "${schemaName}"."${computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom)}" SET "${richTextField.name}V2Blocknote" = $1, "${richTextField.name}V2Markdown" = $2 WHERE id = $3`,
            [blocknoteFieldValue, markdownFieldValue, row.id],
          );
        }
      }
    }
  }
}
