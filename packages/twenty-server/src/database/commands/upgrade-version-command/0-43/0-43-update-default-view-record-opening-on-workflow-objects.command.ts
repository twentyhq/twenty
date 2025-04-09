import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

@Command({
  name: 'upgrade:0-43:update-default-view-record-opening-on-workflow-objects',
  description:
    'Update default view record opening on workflow objects to record page',
})
export class UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
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
        chalk.yellow(`No workflow objects found for workspace ${workspaceId}`),
      );

      return;
    }

    if (!options.dryRun) {
      await this.updateDefaultViewsRecordOpening(
        workflowObjectsMetadata.map((metadata) => metadata.id),
        workspaceId,
      );
    }

    this.logger.log(
      chalk.green(`Command completed for workspace ${workspaceId}.`),
    );
  }

  private async updateDefaultViewsRecordOpening(
    workflowObjectMetadataIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const failOnMetadataCacheMiss = false;
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'view',
        failOnMetadataCacheMiss,
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
