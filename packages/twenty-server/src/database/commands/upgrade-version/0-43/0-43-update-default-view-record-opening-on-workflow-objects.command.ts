import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade-0.43:update-default-view-record-opening-on-workflow-objects',
  description:
    'Update default view record opening on workflow objects to record page',
})
export class UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to update default view record opening on workflow objects to record page',
    );

    for (const [index, workspaceId] of workspaceIds.entries()) {
      await this.processWorkspace(workspaceId, index, workspaceIds.length);
    }

    this.logger.log(chalk.green('Command completed!'));
  }

  async processWorkspace(
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

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
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
