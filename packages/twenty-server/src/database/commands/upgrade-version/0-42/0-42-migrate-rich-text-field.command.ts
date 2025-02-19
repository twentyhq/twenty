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

type AsyncMethod<T> = () => Promise<T>;
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

  private dryRunGuardedOperation = async <T>(operation: AsyncMethod<T>) => {
    if (!this.options.dryRun) {
      return await operation();
    }
  };
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
    this.options = { ...options };
    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    try {
      for (const [index, workspaceId] of workspaceIds.entries()) {
        await this.processWorkspace({
          workspaceId,
          index,
          total: workspaceIds.length,
        });
      }

      this.logger.log(chalk.green('Command completed!'));
    } catch (error) {
      this.logger.log(chalk.red('Error in workspace'));
    }
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

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
        workspaceId,
      );
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
    await this.dryRunGuardedOperation(async () => {
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
    });
  }

  private buildRichTextFieldStandardId(richTextField: FieldMetadataEntity) {
    switch (true) {
      case richTextField.standardId === TASK_STANDARD_FIELD_IDS.body: {
        return TASK_STANDARD_FIELD_IDS.bodyV2;
      }
      case richTextField.standardId === NOTE_STANDARD_FIELD_IDS.body: {
        return NOTE_STANDARD_FIELD_IDS.bodyV2;
      }
      case !richTextField.isCustom: {
        throw new Error(
          `RICH_TEXT does not belong to a Task or a Note standard objects: ${richTextField.id}`,
        );
      }
      default: {
        return null;
      }
    }
  }

  private async createMarkdownBlockNoteV2Columns({
    richTextField,
    workspaceId,
    objectMetadata,
  }: {
    objectMetadata: ObjectMetadataEntity;
    richTextField: FieldMetadataEntity;
    workspaceId: string;
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
    const filteredColumnsToCreate = columnsToCreate.filter(
      ({ columnName }) =>
        !objectMetadata.fields.some(
          ({ name: fieldName }) => fieldName === columnName,
        ),
    );
    const shouldRunMigration = filteredColumnsToCreate.length > 0;

    if (!shouldRunMigration) {
      this.logger.warn(
        `No columns to create for objectMetaData ${objectMetadata.id}`,
      );
    }
    await this.dryRunGuardedOperation(async () => {
      if (shouldRunMigration) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `migrate-rich-text-field-${objectMetadata.nameSingular}-${richTextField.name}`,
          ),
          workspaceId,
          [
            {
              name: computeObjectTargetTable(objectMetadata),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: filteredColumnsToCreate,
            } satisfies WorkspaceMigrationTableAction,
          ],
        );
      }
    });

    return shouldRunMigration;
  }

  private async createIfMissingNewRichTextFieldsColumn({
    richTextFields,
    workspaceId,
  }: ProcessRichTextFieldsArgs): Promise<
    RichTextFieldWithHasCreatedColumnsAndObjectMetadata[]
  > {
    const richTextFieldsWithHasCreatedColumns: RichTextFieldWithHasCreatedColumnsAndObjectMetadata[] =
      [];
    const addToAcc = (
      elementToPush: RichTextFieldWithHasCreatedColumnsAndObjectMetadata,
    ) => richTextFieldsWithHasCreatedColumns.push(elementToPush);

    for (const richTextField of richTextFields) {
      const standardId = this.buildRichTextFieldStandardId(richTextField);

      const newRichTextField: Partial<FieldMetadataEntity> = {
        ...richTextField,
        name: `${richTextField.name}V2`,
        id: undefined,
        type: FieldMetadataType.RICH_TEXT_V2,
        defaultValue: null,
        standardId,
      };

      const existingFieldMetadata =
        await this.fieldMetadataRepository.findOneBy({
          name: newRichTextField.name,
          type: newRichTextField.type,
          standardId: newRichTextField.standardId ?? undefined,
        });
      const fieldMetadataAlreadyExists = isDefined(existingFieldMetadata);

      if (fieldMetadataAlreadyExists) {
        this.logger.warn(
          `FieldMetadata already exists in fieldMetadataRepository name: ${newRichTextField.name} standardId: ${newRichTextField.standardId} type: ${newRichTextField.type}`,
        );
      }

      await this.dryRunGuardedOperation(async () => {
        if (!fieldMetadataAlreadyExists) {
          await this.fieldMetadataRepository.insert(newRichTextField);
        }
      });

      const objectMetadata = await this.objectMetadataRepository.findOne({
        where: { id: richTextField.objectMetadataId },
        relations: { fields: true },
      });

      if (objectMetadata === null) {
        this.logger.warn(
          `Object metadata not found for rich text field ${richTextField.name} in workspace ${workspaceId}`,
        );
        addToAcc({
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
      });

      addToAcc({
        hasCreatedColumns,
        richTextField,
        objectMetadata,
      });
    }

    const hasAtLeastOnePendingMigration =
      richTextFieldsWithHasCreatedColumns.some(
        ({ hasCreatedColumns }) => hasCreatedColumns,
      );
    await this.dryRunGuardedOperation(async () => {
      if (hasAtLeastOnePendingMigration) {
        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
          workspaceId,
        );
      }
    });

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

    return await serverBlockNoteEditor.blocksToMarkdownLossy(
      jsonParsedblocknoteFieldValue,
    );
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

        const shouldForceUpdate = !hasCreatedColumns && this.options.force;
        const shouldUpdateFieldValue = hasCreatedColumns || shouldForceUpdate;

        if (shouldForceUpdate) {
          this.logger.warn(
            `Will force udpate RICH_TEXT_V2 fieldValue for ${richTextField.id} of objectMetada ${objectMetadata.id} even it has already been migrated in the past`,
          );
        }
        await this.dryRunGuardedOperation(async () => {
          if (shouldUpdateFieldValue) {
            await workspaceDataSource.query(
              `UPDATE "${schemaName}"."${computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom)}" SET "${richTextField.name}V2Blocknote" = $1, "${richTextField.name}V2Markdown" = $2 WHERE id = $3`,
              [blocknoteFieldValue, markdownFieldValue, row.id],
            );
          }
        });
      }
    }
  }
}
