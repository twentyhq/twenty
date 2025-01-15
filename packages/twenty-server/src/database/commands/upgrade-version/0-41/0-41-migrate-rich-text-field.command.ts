import { InjectRepository } from '@nestjs/typeorm';

import { ServerBlockNoteEditor } from '@blocknote/server-util';
import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
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
import { isDefined } from 'src/utils/is-defined';

@Command({
  name: 'upgrade-0.41:migrate-rich-text-field',
  description: 'Migrate RICH_TEXT fields to new composite structure',
})
export class MigrateRichTextFieldCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate RICH_TEXT fields to new composite structure',
    );

    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    let workspaceIterator = 1;

    for (const workspaceId of workspaceIds) {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      try {
        const richTextFields = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.RICH_TEXT,
          },
        });

        if (!richTextFields.length) {
          this.logger.log('No RICH_TEXT fields found in this workspace');
          workspaceIterator++;
          continue;
        }

        this.logger.log(`Found ${richTextFields.length} RICH_TEXT fields`);

        for (const richTextField of richTextFields) {
          const newRichTextField: Partial<FieldMetadataEntity> = {
            ...richTextField,
            name: `${richTextField.name}V2`,
            id: undefined,
            type: FieldMetadataType.RICH_TEXT_V2,
            defaultValue: null,
          };

          await this.fieldMetadataRepository.insert(newRichTextField);

          const objectMetadata = await this.objectMetadataRepository.findOne({
            where: { id: richTextField.objectMetadataId },
          });

          if (!isDefined(objectMetadata)) {
            this.logger.log(
              `Object metadata not found for rich text field ${richTextField.name} in workspace ${workspaceId}`,
            );
            continue;
          }

          await this.workspaceMigrationService.createCustomMigration(
            generateMigrationName(
              `migrate-rich-text-field-${objectMetadata.nameSingular}-${richTextField.name}`,
            ),
            workspaceId,
            [
              {
                name: computeObjectTargetTable(objectMetadata),
                action: WorkspaceMigrationTableActionType.ALTER,
                columns: [
                  {
                    action: WorkspaceMigrationColumnActionType.CREATE,
                    columnName: `${richTextField.name}V2Blocknote`,
                    columnType: 'text',
                    isNullable: true,
                    defaultValue: null,
                  } satisfies WorkspaceMigrationColumnCreate,
                  {
                    action: WorkspaceMigrationColumnActionType.CREATE,
                    columnName: `${richTextField.name}V2Markdown`,
                    columnType: 'text',
                    isNullable: true,
                    defaultValue: null,
                  } satisfies WorkspaceMigrationColumnCreate,
                ],
              } satisfies WorkspaceMigrationTableAction,
            ],
          );
        }

        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
          workspaceId,
        );

        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );

        const serverBlockNoteEditor = ServerBlockNoteEditor.create();

        for (const richTextField of richTextFields) {
          const objectMetadata = await this.objectMetadataRepository.findOne({
            where: { id: richTextField.objectMetadataId },
          });

          if (!isDefined(objectMetadata)) {
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
            const markdownFieldValue = blocknoteFieldValue
              ? await serverBlockNoteEditor.blocksToMarkdownLossy(
                  JSON.parse(blocknoteFieldValue),
                )
              : null;

            await workspaceDataSource.query(
              `UPDATE "${schemaName}"."${computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom)}" SET "${richTextField.name}V2Blocknote" = $1, "${richTextField.name}V2Markdown" = $2 WHERE id = $3`,
              [blocknoteFieldValue, markdownFieldValue, row.id],
            );
          }
        }

        workspaceIterator++;
        this.logger.log(
          chalk.green(`Command completed for workspace ${workspaceId}`),
        );
      } catch (error) {
        this.logger.error(
          chalk.red(`Error in workspace ${workspaceId}: ${error.message}`),
        );
        workspaceIterator++;
      }
    }

    this.logger.log(chalk.green('Command completed!'));
  }
}
