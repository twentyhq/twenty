import { UseFilters, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { WorkerHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/worker.health';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkerQueueStatusDTO } from 'src/engine/core-modules/queue-status/dtos/worker-queue-status.dto';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SECURITY),
)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class QueueStatusResolver {
  constructor(private readonly workerHealthIndicator: WorkerHealthIndicator) {}

  @Query(() => [WorkerQueueStatusDTO])
  async workerQueueStatuses(): Promise<WorkerQueueStatusDTO[]> {
    const queueDetails = await Promise.all(
      Object.values(MessageQueue).map((queueName) =>
        this.workerHealthIndicator.getQueueDetails(queueName),
      ),
    );

    return queueDetails.filter(isDefined).map((queue) => ({
      queueName: queue.queueName,
      workers: queue.workers,
      waiting: queue.metrics.waiting,
      active: queue.metrics.active,
      delayed: queue.metrics.delayed,
      failureRate: queue.metrics.failureRate,
    }));
  }
}
