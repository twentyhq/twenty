import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { In, Repository } from 'typeorm';

import { BatchMaintainedWorkspacesMigrationCommandRunner } from 'src/database/commands/migration-command/batch-maintained-workspaces-migration-command.runner';
import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

@MigrationCommand({
  name: 'update-default-view-record-opening-on-workflow-objects',
  description:
    'Update default view record opening on workflow objects to record page',
  version: '0.43',
})
export class UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand extends BatchMaintainedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  async runMigrationCommandOnWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      const workflowObjectsMetadata = await this.objectMetadataRepository.find({
        select: ['id'],
        where: {
          workspaceId,
          standardId: In([
            STANDARD_OBJECT_IDS.workflow,
            STANDARD_OBJECT_IDS.workflowVersion,
            STANDARD_OBJECT_IDS.workflowRun,
          ]),
        },
      });

      if (workflowObjectsMetadata.length === 0) {
        this.logger.log(
          chalk.yellow(
            `No workflow objects found for workspace ${workspaceId}`,
          ),
        );

        return;
      }

      await this.updateDefaultViewsRecordOpening(
        workflowObjectsMetadata.map((metadata) => metadata.id),
        workspaceId,
      );

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}.`),
      );
    } catch (error) {
      this.logger.log(
        chalk.red(`Error in workspace ${workspaceId} - ${error.message}`),
      );
    }
  }

  private async updateDefaultViewsRecordOpening(
    workflowObjectMetadataIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'view',
      );

    await viewRepository.update(
      {
        objectMetadataId: In(workflowObjectMetadataIds),
        key: 'INDEX',
      },
      {
        openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
      },
    );
  }
}
