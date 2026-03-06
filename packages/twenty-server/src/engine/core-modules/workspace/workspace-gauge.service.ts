import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceGaugeService implements OnModuleInit {
  private readonly logger = new Logger(WorkspaceGaugeService.name);

  constructor(
    private readonly metricsService: MetricsService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  onModuleInit() {
    for (const status of Object.values(WorkspaceActivationStatus)) {
      this.metricsService.createObservableGauge({
        metricName: `twenty_workspaces_by_status_${status.toLowerCase()}`,
        options: {
          description: `Number of workspaces with activation status ${status}`,
        },
        callback: async () => {
          return this.getWorkspaceCountByStatus(status);
        },
        cacheValue: true,
      });
    }

    this.metricsService.createObservableGauge({
      metricName: 'twenty_workspaces_deleted_total',
      options: {
        description: 'Total number of soft-deleted workspaces',
      },
      callback: async () => {
        return this.getDeletedWorkspacesCount();
      },
      cacheValue: true,
    });
  }

  private async getWorkspaceCountByStatus(
    status: WorkspaceActivationStatus,
  ): Promise<number> {
    try {
      return this.workspaceRepository.count({
        where: {
          activationStatus: status,
          deletedAt: IsNull(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count workspaces with status ${status}`,
        error,
      );

      return 0;
    }
  }

  private async getDeletedWorkspacesCount(): Promise<number> {
    try {
      return this.workspaceRepository.count({
        where: { deletedAt: Not(IsNull()) },
        withDeleted: true,
      });
    } catch (error) {
      this.logger.error('Failed to count deleted workspaces', error);

      return 0;
    }
  }
}
