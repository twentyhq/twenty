import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Any, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';

@Command({
  name: 'upgrade-0.30:fix-view-filter-operand-for-date-time',
  description: 'Fix the view filter operand for date time fields',
})
export class FixViewFilterOperandForDateTimeCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly dataSourceService: DataSourceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    for (const workspaceId of workspaceIds) {
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

        const viewFilterRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFilterWorkspaceEntity>(
            workspaceId,
            'viewFilter',
          );

        const dateTimeFieldMetadata = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.DATE_TIME,
          },
        });

        const dateTimeFieldMetadataIds = dateTimeFieldMetadata.map(
          (fieldMetadata) => fieldMetadata.id,
        );

        await viewFilterRepository.update(
          {
            operand: 'lessThan',
            fieldMetadataId: Any(dateTimeFieldMetadataIds),
          },
          {
            operand: 'before',
          },
        );

        await viewFilterRepository.update(
          {
            operand: 'moreThan',
            fieldMetadataId: Any(dateTimeFieldMetadataIds),
          },
          {
            operand: 'after',
          },
        );
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Could not connect to workspace data source for workspace ${workspaceId}`,
          ),
        );
        continue;
      }
    }
  }
}
