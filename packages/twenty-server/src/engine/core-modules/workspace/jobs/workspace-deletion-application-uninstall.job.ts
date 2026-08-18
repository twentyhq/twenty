import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, type Repository } from 'typeorm';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type WorkspaceDeletionApplicationUninstallJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class WorkspaceDeletionApplicationUninstallJob {
  private readonly logger = new Logger(
    WorkspaceDeletionApplicationUninstallJob.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  @Process(WorkspaceDeletionApplicationUninstallJob.name)
  async handle({
    workspaceId,
  }: WorkspaceDeletionApplicationUninstallJobData): Promise<void> {
    const result = await this.postgresAdvisoryLockService.tryWithLock(
      `workspace-deletion-application-uninstall-${workspaceId}`,
      async () => {
        const workspace = await this.workspaceRepository.findOne({
          where: { id: workspaceId },
          withDeleted: true,
        });

        if (
          !workspace?.deletedAt ||
          workspace.applicationUninstallHooksCompletedAt
        ) {
          return;
        }

        await this.applicationSyncService.runUninstallHooksForWorkspaceApplications(
          {
            workspaceId,
            workspaceDeletedAt: workspace.deletedAt,
          },
        );

        await this.workspaceRepository.update(
          {
            id: workspaceId,
            deletedAt: workspace.deletedAt,
            applicationUninstallHooksCompletedAt: IsNull(),
          },
          { applicationUninstallHooksCompletedAt: new Date() },
        );
      },
    );

    if (!result.acquired) {
      this.logger.log(
        `Skipping workspace ${workspaceId} uninstall hooks because another worker holds the lock`,
      );
    }
  }
}
