import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

const AGGREGATE_OPERATION_OPTIONS = [
  {
    value: AGGREGATE_OPERATIONS.avg,
    label: 'Average',
    position: 0,
    color: 'red',
  },
  {
    value: AGGREGATE_OPERATIONS.count,
    label: 'Count',
    position: 1,
    color: 'purple',
  },
  {
    value: AGGREGATE_OPERATIONS.max,
    label: 'Maximum',
    position: 2,
    color: 'sky',
  },
  {
    value: AGGREGATE_OPERATIONS.min,
    label: 'Minimum',
    position: 3,
    color: 'turquoise',
  },
  {
    value: AGGREGATE_OPERATIONS.sum,
    label: 'Sum',
    position: 4,
    color: 'yellow',
  },
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
  {
    value: AGGREGATE_OPERATIONS.countTrue,
    label: 'Count true',
    position: 10,
    color: 'red',
  },
  {
    value: AGGREGATE_OPERATIONS.countFalse,
    label: 'Count false',
    position: 11,
    color: 'purple',
  },
];

@Command({
  name: 'upgrade:0-44:update-view-aggregate-operations',
  description:
    'Update View and ViewField entities with new aggregate operations (countTrue, countFalse)',
})
export class UpdateViewAggregateOperationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.updateViewAggregateOperations(workspaceId);
    await this.updateViewFieldAggregateOperations(workspaceId);

    // Get the current metadata version for the workspace
    const metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (metadataVersion) {
      // Flush the workspace schema cache to ensure changes are reflected
      await this.workspaceCacheStorageService.flush(
        workspaceId,
        metadataVersion,
      );
      this.logger.log(
        `Flushed cache for workspace ${workspaceId} with metadata version ${metadataVersion}`,
      );
    } else {
      this.logger.warn(
        `Could not find metadata version for workspace ${workspaceId}, skipping cache flush`,
      );
    }

    this.logger.log(
      chalk.green(`Command completed for workspace ${workspaceId}.`),
    );
  }

  private async updateViewAggregateOperations(
    workspaceId: string,
  ): Promise<void> {
    const viewObjectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        workspaceId,
        standardId: STANDARD_OBJECT_IDS.view,
      },
      relations: ['fields'],
    });

    if (!viewObjectMetadata) {
      this.logger.warn(
        `View object metadata not found for workspace ${workspaceId}`,
      );

      return;
    }

    const kanbanAggregateOperationField = viewObjectMetadata.fields.find(
      (field) => field.name === 'kanbanAggregateOperation',
    );

    if (!kanbanAggregateOperationField) {
      this.logger.warn(
        `kanbanAggregateOperation field not found for workspace ${workspaceId}`,
      );

      return;
    }

    // Replace the options with the complete set
    await this.fieldMetadataRepository.update(
      { id: kanbanAggregateOperationField.id },
      { options: AGGREGATE_OPERATION_OPTIONS },
    );

    this.logger.log(
      `Updated kanbanAggregateOperation options for workspace ${workspaceId}`,
    );
  }

  private async updateViewFieldAggregateOperations(
    workspaceId: string,
  ): Promise<void> {
    const viewFieldObjectMetadata = await this.objectMetadataRepository.findOne(
      {
        where: {
          workspaceId,
          standardId: STANDARD_OBJECT_IDS.viewField,
        },
        relations: ['fields'],
      },
    );

    if (!viewFieldObjectMetadata) {
      this.logger.warn(
        `ViewField object metadata not found for workspace ${workspaceId}`,
      );

      return;
    }

    const aggregateOperationField = viewFieldObjectMetadata.fields.find(
      (field) => field.name === 'aggregateOperation',
    );

    if (!aggregateOperationField) {
      this.logger.warn(
        `aggregateOperation field not found for workspace ${workspaceId}`,
      );

      return;
    }

    // Replace the options with the complete set
    await this.fieldMetadataRepository.update(
      { id: aggregateOperationField.id },
      { options: AGGREGATE_OPERATION_OPTIONS },
    );

    this.logger.log(
      `Updated aggregateOperation options for workspace ${workspaceId}`,
    );
  }
}
