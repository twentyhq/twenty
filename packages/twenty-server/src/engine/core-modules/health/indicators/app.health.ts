import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HealthStateManager } from 'src/engine/core-modules/health/utils/health-state-manager.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';

@Injectable()
export class AppHealthIndicator {
  private stateManager = new HealthStateManager();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly workspaceHealthService: WorkspaceHealthService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('app');

    try {
      const workspaces = await this.objectMetadataService.findMany();
      const workspaceIds = [...new Set(workspaces.map((w) => w.workspaceId))];

      const workspaceStats = await Promise.all(
        workspaceIds.map(async (workspaceId) => {
          const pendingMigrations =
            await this.workspaceMigrationService.getPendingMigrations(
              workspaceId,
            );

          return {
            workspaceId,
            pendingMigrations: pendingMigrations.length,
            isCritical: pendingMigrations.length > 0,
          };
        }),
      );

      const details = {
        system: {
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
        },
        overview: {
          totalWorkspacesCount: workspaceIds.length,
          criticalWorkspacesCount: workspaceStats.filter(
            (stat) => stat.isCritical,
          ).length,
        },
        criticalWorkspaces:
          workspaceStats.filter((stat) => stat.isCritical).length > 0
            ? workspaceStats
                .filter((stat) => stat.isCritical)
                .map((stat) => ({
                  workspaceId: stat.workspaceId,
                  pendingMigrations: stat.pendingMigrations,
                }))
            : null,
      };

      const isHealthy = workspaceStats.every((stat) => !stat.isCritical);

      if (isHealthy) {
        this.stateManager.updateState(details);

        return indicator.up({ details });
      }

      this.stateManager.updateState(details);

      return indicator.down({
        message: `Found ${details.criticalWorkspaces?.length} workspaces with pending migrations`,
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
