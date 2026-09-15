import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getWorkspaceApplicationUninstallLockName } from 'src/engine/core-modules/workspace/utils/get-workspace-application-uninstall-lock-name.util';
import { isWorkspaceDeletionPending } from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-pending.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

export type WorkspaceDeletionApplicationUninstallJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.logicFunctionQueue)
export class WorkspaceDeletionApplicationUninstallJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationUninstallService: ApplicationUninstallService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  @Process(WorkspaceDeletionApplicationUninstallJob.name)
  async handle({
    workspaceId,
  }: WorkspaceDeletionApplicationUninstallJobData): Promise<void> {
    const advisoryLockResult =
      await this.postgresAdvisoryLockService.tryWithLock(
        getWorkspaceApplicationUninstallLockName(workspaceId),
        async () => {
          const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
            withDeleted: true,
          });

          if (!isWorkspaceDeletionPending(workspace)) {
            return;
          }

          await this.applicationUninstallService.runUninstallHooksForWorkspaceDeletion(
            {
              workspaceId,
              workspaceDeletedAt: workspace.deletedAt,
            },
          );
        },
      );

    if (!advisoryLockResult.acquired) {
      throw new WorkspaceException(
        `Workspace ${workspaceId} application uninstall is already running`,
        WorkspaceExceptionCode.APPLICATION_UNINSTALL_IN_PROGRESS,
      );
    }
  }
}
