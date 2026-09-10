import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { WorkerQueueStatusDTO } from 'src/engine/core-modules/admin-panel/dtos/worker-queue-status.dto';
import { WorkerHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/worker.health';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@CoreResolver()
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SECURITY),
)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class WorkerQueueStatusResolver {
  constructor(private readonly workerHealthIndicator: WorkerHealthIndicator) {}

  @Query(() => [WorkerQueueStatusDTO])
  async workerQueueStatuses(): Promise<WorkerQueueStatusDTO[]> {
    return Promise.all(
      Object.values(MessageQueue).map(async (queueName) => {
        const queueHealth =
          await this.workerHealthIndicator.getQueueDetails(queueName);

        return {
          queueName,
          workers: queueHealth?.workers ?? 0,
          waiting: queueHealth?.metrics.waiting ?? null,
          active: queueHealth?.metrics.active ?? null,
          delayed: queueHealth?.metrics.delayed ?? null,
          failureRate: queueHealth?.metrics.failureRate ?? null,
        };
      }),
    );
  }
}
