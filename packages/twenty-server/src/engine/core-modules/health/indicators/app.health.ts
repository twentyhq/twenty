import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { HealthStateManager } from 'src/engine/core-modules/health/utils/health-state-manager.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';

@Injectable()
export class AppHealthIndicator {
  private stateManager = new HealthStateManager();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('app');

    try {
      const totalErroredWorkspacesCount =
        await this.workspaceMigrationService.countWorkspacesWithPendingMigrations();

      const sampledErroredWorkspaces =
        await this.workspaceMigrationService.getWorkspacesWithPendingMigrations(
          500,
        );

      const totalWorkspaceCount = await this.workspaceRepository.count();

      const details = {
        system: {
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
        },
        overview: {
          totalWorkspacesCount: totalWorkspaceCount,
          erroredWorkspaceCount: totalErroredWorkspacesCount,
        },
        erroredWorkspace:
          totalErroredWorkspacesCount > 0
            ? sampledErroredWorkspaces.map((workspace) => ({
                workspaceId: workspace.workspaceId,
                pendingMigrations: workspace.pendingMigrations,
              }))
            : null,
      };

      if (totalErroredWorkspacesCount === 0) {
        this.stateManager.updateState(details);

        return indicator.up({ details });
      }

      this.stateManager.updateState(details);

      return indicator.down({
        message: `Found ${totalErroredWorkspacesCount} workspaces with pending migrations`,
        details,
      });
    } catch (error) {
      const stateWithAge = this.stateManager.getStateWithAge();

      return indicator.down({
        message: error.message,
        details: {
          system: {
            nodeVersion: process.version,
            timestamp: new Date().toISOString(),
          },
          stateHistory: stateWithAge,
        },
      });
    }
  }
}
