import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getWorkspaceApplicationUninstallLockName } from 'src/engine/core-modules/workspace/utils/get-workspace-application-uninstall-lock-name.util';
import { isWorkspaceSuspensionUninstallRequestPending } from 'src/engine/core-modules/workspace/utils/is-workspace-suspension-uninstall-request-pending.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

export type WorkspaceSuspensionApplicationUninstallJobData = {
  workspaceId: string;
  workspaceSuspensionUninstallRequestedAt: string;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class WorkspaceSuspensionApplicationUninstallJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationUninstallService: ApplicationUninstallService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  @Process(WorkspaceSuspensionApplicationUninstallJob.name)
  async handle({
    workspaceId,
    workspaceSuspensionUninstallRequestedAt,
  }: WorkspaceSuspensionApplicationUninstallJobData): Promise<void> {
    const advisoryLockResult =
      await this.postgresAdvisoryLockService.tryWithLock(
        getWorkspaceApplicationUninstallLockName(workspaceId),
        async () => {
          const workspace = await this.workspaceRepository.findOne({
            where: { id: workspaceId },
            withDeleted: true,
          });

          if (
            !isWorkspaceSuspensionUninstallRequestPending(
              workspace,
              workspaceSuspensionUninstallRequestedAt,
            )
          ) {
            return;
          }

          await this.applicationUninstallService.runUninstallHooksForWorkspaceSuspension(
            {
              workspaceId,
              workspaceSuspendedAt: workspace.suspendedAt,
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
