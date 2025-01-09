import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
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
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
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

      // eslint-disable-next-line
      try {
        const richTextFields = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.RICH_TEXT,
          },
        });

        this.logger.log(`Found ${richTextFields.length} RICH_TEXT fields`);

        if (!richTextFields.length) {
          this.logger.log('No RICH_TEXT fields found in this workspace');
          workspaceIterator++;
          continue;
        }

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

          const deprecatedField: Partial<FieldMetadataEntity> = {
            ...richTextField,
            type: FieldMetadataType.RICH_TEXT_DEPRECATED,
          };

          await this.fieldMetadataRepository.save(deprecatedField);

          const newRichTextField: Partial<FieldMetadataEntity> = {
            ...richTextField,
            id: undefined,
            type: FieldMetadataType.RICH_TEXT,
            defaultValue: null,
          };

          await this.fieldMetadataRepository.save(newRichTextField);

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
                    action: WorkspaceMigrationColumnActionType.ALTER,
                    currentColumnDefinition: {
                      columnName: `${richTextField.name}`,
                      columnType: 'text',
                      isNullable: true,
                      defaultValue: null,
                    },
                    alteredColumnDefinition: {
                      columnName: `${richTextField.name}Blocknote`,
                      columnType: 'text',
                      isNullable: true,
                      defaultValue: null,
                    },
                  } satisfies WorkspaceMigrationColumnAlter,
                  {
                    action: WorkspaceMigrationColumnActionType.CREATE,
                    columnName: `${richTextField.name}Markdown`,
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

        workspaceIterator++;
        this.logger.log(
          chalk.green(`Command completed for workspace ${workspaceId}`),
        );
      } catch (error) {
        throw error;
        /* this.logger.error(
          chalk.red(`Error in workspace ${workspaceId}: ${error.message}`),
        );
        workspaceIterator++; */
      }
    }

    this.logger.log(chalk.green('Command completed!'));
  }
}
