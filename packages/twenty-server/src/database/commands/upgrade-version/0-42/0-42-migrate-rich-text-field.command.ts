import { InjectRepository } from '@nestjs/typeorm';

import { ServerBlockNoteEditor } from '@blocknote/server-util';
import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { FieldMetadataType, isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Upgrade042CommandOptions } from 'src/database/commands/upgrade-version/0-42/0-42-upgrade-version.command';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  NOTE_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

type MigrateRichTextContentArgs = {
  richTextFieldsWithHasCreatedColumns: RichTextFieldWithHasCreatedColumnsAndObjectMetadata[];
  workspaceId: string;
};

type RichTextFieldWithHasCreatedColumnsAndObjectMetadata = {
  richTextField: FieldMetadataEntity;
  hasCreatedColumns: boolean;
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

@Command({
  name: 'upgrade-0.42:migrate-rich-text-field',
  description: 'Migrate RICH_TEXT fields to new composite structure',
})
export class MigrateRichTextFieldCommand extends ActiveWorkspacesCommandRunner {
  private options: Upgrade042CommandOptions;
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FeatureFlag, 'core')
    protected readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
  }

  @Option({
    flags: '-f, --force [boolean]',
    description:
      'Force RICH_TEXT_FIELD value update even if column migration has already be run',
    required: false,
  })
  parseForceValue(val?: boolean): boolean {
    return val ?? false;
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: Upgrade042CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate RICH_TEXT fields to new composite structure',
    );
    if (options.force) {
      this.logger.warn('Running in force mode');
    }
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

      const richTextFieldsWithHasCreatedColumns =
        await this.createIfMissingNewRichTextFieldsColumn({
          richTextFields,
          workspaceId,
        });

      await this.migrateToNewRichTextFieldsColumn({
        richTextFieldsWithHasCreatedColumns,
        workspaceId,
      });

      await this.enableRichTextV2FeatureFlag(workspaceId);

      if (!this.options.dryRun) {
        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );
      }

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}`),
      );
    } catch (error) {
      this.logger.log(chalk.red(`Error in workspace ${workspaceId}: ${error}`));
    }
  }

  private async enableRichTextV2FeatureFlag(
    workspaceId: string,
  ): Promise<void> {
    if (!this.options.dryRun) {
      await this.featureFlagRepository.upsert(
        {
          workspaceId,
          key: FeatureFlagKey.IsRichTextV2Enabled,
          value: true,
        },
        {
          conflictPaths: ['workspaceId', 'key'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    }
  }

  private buildRichTextFieldStandardId(richTextField: FieldMetadataEntity) {
    switch (true) {
      case richTextField.standardId === TASK_STANDARD_FIELD_IDS.body: {
        return TASK_STANDARD_FIELD_IDS.bodyV2;
      }
      case richTextField.standardId === NOTE_STANDARD_FIELD_IDS.body: {
        return NOTE_STANDARD_FIELD_IDS.bodyV2;
      }
      case richTextField.isCustom: {
        return null;
      }
      default: {
        throw new Error(
          `RICH_TEXT does not belong to a Task or a Note standard objects: ${richTextField.id}`,
        );
      }
    }
  }

  private async createMarkdownBlockNoteV2Columns({
    richTextField,
    workspaceId,
    objectMetadata,
    fieldMetadataAlreadyExisting,
  }: {
    objectMetadata: ObjectMetadataEntity;
    richTextField: FieldMetadataEntity;
    workspaceId: string;
    fieldMetadataAlreadyExisting: boolean;
  }) {
    const columnsToCreate: WorkspaceMigrationColumnCreate[] = [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: `${richTextField.name}V2Blocknote`,
        columnType: 'text',
        isNullable: true,
        defaultValue: null,
      },
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: `${richTextField.name}V2Markdown`,
        columnType: 'text',
        isNullable: true,
        defaultValue: null,
      },
    ] as const;

    const shouldForceCreateColumns =
      this.options.force && fieldMetadataAlreadyExisting;

    if (shouldForceCreateColumns) {
      this.logger.warn(
        `Force creating V2 columns for workspaceId: ${workspaceId} objectMetadaId: ${objectMetadata.id}`,
      );
    }
    const shouldCreateColumns =
      !fieldMetadataAlreadyExisting || shouldForceCreateColumns;

    if (!this.options.dryRun && shouldCreateColumns) {
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(
          `migrate-rich-text-field-${objectMetadata.nameSingular}-${richTextField.name}`,
        ),
        workspaceId,
        [
          {
            name: computeObjectTargetTable(objectMetadata),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: columnsToCreate,
          } satisfies WorkspaceMigrationTableAction,
        ],
      );
    }

    return shouldCreateColumns;
  }

  private async createIfMissingNewRichTextFieldsColumn({
    richTextFields,
    workspaceId,
  }: ProcessRichTextFieldsArgs): Promise<
    RichTextFieldWithHasCreatedColumnsAndObjectMetadata[]
  > {
    const richTextFieldsWithHasCreatedColumns: RichTextFieldWithHasCreatedColumnsAndObjectMetadata[] =
      [];

    for (const richTextField of richTextFields) {
      const standardId = this.buildRichTextFieldStandardId(richTextField);

      const newRichTextField: Partial<FieldMetadataEntity> = {
        ...richTextField,
        name: `${richTextField.name}V2`,
        id: undefined,
        type: FieldMetadataType.RICH_TEXT_V2,
        defaultValue: null,
        standardId,
        workspaceId,
      };

      const existingFieldMetadata =
        await this.fieldMetadataRepository.findOneBy({
          name: newRichTextField.name,
          type: newRichTextField.type,
          standardId: newRichTextField.standardId ?? undefined,
          workspaceId,
        });
      const fieldMetadataAlreadyExisting = isDefined(existingFieldMetadata);

      if (fieldMetadataAlreadyExisting) {
        this.logger.warn(
          `FieldMetadata already exists in fieldMetadataRepository name: ${newRichTextField.name} standardId: ${newRichTextField.standardId} type: ${newRichTextField.type} workspaceId: ${workspaceId}`,
        );
      }

      if (!this.options.dryRun && !fieldMetadataAlreadyExisting) {
        await this.fieldMetadataRepository.insert(newRichTextField);
      }

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
        richTextFieldsWithHasCreatedColumns.push({
          hasCreatedColumns: false,
          richTextField,
          objectMetadata,
        });
        continue;
      }

      const hasCreatedColumns = await this.createMarkdownBlockNoteV2Columns({
        objectMetadata,
        richTextField,
        workspaceId,
        fieldMetadataAlreadyExisting,
      });

      richTextFieldsWithHasCreatedColumns.push({
        hasCreatedColumns,
        richTextField,
        objectMetadata,
      });
    }

    const hasAtLeastOnePendingMigration =
      richTextFieldsWithHasCreatedColumns.some(
        ({ hasCreatedColumns }) => hasCreatedColumns,
      );

    if (!this.options.dryRun && hasAtLeastOnePendingMigration) {
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );
    }

    return richTextFieldsWithHasCreatedColumns;
  }

  private jsonParseOrSilentlyFail(input: string): null | unknown {
    try {
      return JSON.parse(input);
    } catch (e) {
      return null;
    }
  }

  private async getMardownFieldValue({
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
    richTextFieldsWithHasCreatedColumns,
    workspaceId,
  }: MigrateRichTextContentArgs) {
    const serverBlockNoteEditor = ServerBlockNoteEditor.create();

    for (const {
      richTextField,
      hasCreatedColumns,
      objectMetadata,
    } of richTextFieldsWithHasCreatedColumns) {
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
        `SELECT id, "${richTextField.name}" FROM "${schemaName}"."${computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom)}"`,
      );

      this.logger.log(`Generating markdown for ${rows.length} records`);

      for (const row of rows) {
        const blocknoteFieldValue = row[richTextField.name];
        const markdownFieldValue = await this.getMardownFieldValue({
          blocknoteFieldValue,
          serverBlockNoteEditor,
        });

        if (this.options.force) {
          this.logger.warn(
            `Force udpate rowId: ${row.id} RICH_TEXT_FIELD ${richTextField.id} objectMetadata ${objectMetadata.id}`,
          );
        }
        if (!this.options.dryRun && (hasCreatedColumns || this.options.force)) {
          await workspaceDataSource.query(
            `UPDATE "${schemaName}"."${computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom)}" SET "${richTextField.name}V2Blocknote" = $1, "${richTextField.name}V2Markdown" = $2 WHERE id = $3`,
            [blocknoteFieldValue, markdownFieldValue, row.id],
          );
        }
      }
    }
  }
}
