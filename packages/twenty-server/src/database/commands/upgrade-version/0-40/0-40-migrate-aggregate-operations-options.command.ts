import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  VIEW_FIELD_STANDARD_FIELD_IDS,
  VIEW_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { isDefined } from 'src/utils/is-defined';

@Command({
  name: 'upgrade-0.40:migrate-aggregate-operation-options',
  description: 'Add aggregate operations options to relevant fields',
})
export class MigrateAggregateOperationOptionsCommand extends ActiveWorkspacesCommandRunner {
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

  ADDITIONAL_AGGREGATE_OPERATIONS = [
    {
      value: AGGREGATE_OPERATIONS.countEmpty,
      label: 'Count empty',
      position: 5,
      color: 'red',
    },
    {
      value: AGGREGATE_OPERATIONS.countNotEmpty,
      label: 'Count not empty',
      position: 6,
      color: 'purple',
    },
    {
      value: AGGREGATE_OPERATIONS.countUniqueValues,
      label: 'Count unique values',
      position: 7,
      color: 'sky',
    },
    {
      value: AGGREGATE_OPERATIONS.percentageEmpty,
      label: 'Percent empty',
      position: 8,
      color: 'turquoise',
    },
    {
      value: AGGREGATE_OPERATIONS.percentageNotEmpty,
      label: 'Percent not empty',
      position: 9,
      color: 'yellow',
    },
  ];

  ADDITIONAL_AGGREGATE_OPERATIONS_VALUES =
    this.ADDITIONAL_AGGREGATE_OPERATIONS.map((option) => option.value);

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to migrate aggregate operations options to include count operations',
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
        const viewFieldObjectMetadata =
          await this.objectMetadataRepository.findOne({
            where: {
              workspaceId,
              standardId: STANDARD_OBJECT_IDS.viewField,
            },
          });

        if (!isDefined(viewFieldObjectMetadata)) {
          throw new Error(
            `View field object metadata not found for workspace ${workspaceId}`,
          );
        }

        const viewFieldAggregateOperationFieldMetadata =
          await this.fieldMetadataRepository.findOne({
            where: {
              workspaceId,
              objectMetadataId: viewFieldObjectMetadata.id,
              standardId: VIEW_FIELD_STANDARD_FIELD_IDS.aggregateOperation,
            },
          });

        if (isDefined(viewFieldAggregateOperationFieldMetadata)) {
          await this.updateAggregateOperationField(
            workspaceId,
            viewFieldAggregateOperationFieldMetadata,
            viewFieldObjectMetadata,
          );
        }

        const viewObjectMetadata = await this.objectMetadataRepository.findOne({
          where: {
            workspaceId,
            standardId: STANDARD_OBJECT_IDS.view,
          },
        });

        if (!isDefined(viewObjectMetadata)) {
          throw new Error(
            `View object metadata not found for workspace ${workspaceId}`,
          );
        }

        const viewAggregateOperationFieldMetadata =
          await this.fieldMetadataRepository.findOne({
            where: {
              workspaceId,
              objectMetadataId: viewObjectMetadata.id,
              standardId: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperation,
            },
          });

        if (isDefined(viewAggregateOperationFieldMetadata)) {
          await this.updateAggregateOperationField(
            workspaceId,
            viewAggregateOperationFieldMetadata,
            viewObjectMetadata,
          );
        }

        if (
          isDefined(viewAggregateOperationFieldMetadata) ||
          isDefined(viewFieldAggregateOperationFieldMetadata)
        ) {
          await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
            workspaceId,
          );

          await this.workspaceMetadataVersionService.incrementMetadataVersion(
            workspaceId,
          );
        }
        workspaceIterator++;
        this.logger.log(
          chalk.green(`Command completed for workspace ${workspaceId}.`),
        );
      } catch {
        this.logger.log(chalk.red(`Error in workspace ${workspaceId}.`));
        workspaceIterator++;
      }
    }
    this.logger.log(chalk.green(`Command completed!`));
  }

  private async updateAggregateOperationField(
    workspaceId: string,
    fieldMetadata: FieldMetadataEntity,
    objectMetadata: ObjectMetadataEntity,
  ) {
    if (
      fieldMetadata.options.some((option) => {
        return this.ADDITIONAL_AGGREGATE_OPERATIONS_VALUES.includes(
          option.value as AGGREGATE_OPERATIONS,
        );
      })
    ) {
      this.logger.log(
        `Aggregate operation field metadata ${fieldMetadata.name} already has the required options`,
      );
    } else {
      const updatedFieldMetadata = {
        ...fieldMetadata,
        options: [
          ...fieldMetadata.options,
          ...this.ADDITIONAL_AGGREGATE_OPERATIONS.map((operation) => ({
            ...operation,
            id: v4(),
          })),
        ],
      };

      await this.fieldMetadataRepository.save(updatedFieldMetadata);

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(
          `update-${objectMetadata.nameSingular}-aggregate-operation`,
        ),
        workspaceId,
        [
          {
            name: computeObjectTargetTable(objectMetadata),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.ALTER,
              fieldMetadata,
              updatedFieldMetadata,
            ),
          } satisfies WorkspaceMigrationTableAction,
        ],
      );
    }
  }
}
