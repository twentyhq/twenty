import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { APP_HEALTH_ISSUE_CATEGORIES } from 'src/engine/core-modules/health/constants/app-health-issue-categories.const';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';

@Injectable()
export class AppHealthIndicator {
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
          const [healthIssues, pendingMigrations] = await Promise.all([
            this.workspaceHealthService.healthCheck(workspaceId),
            this.workspaceMigrationService.getPendingMigrations(workspaceId),
          ]);

          const issuesSummary = {
            structural: healthIssues.filter((issue) =>
              APP_HEALTH_ISSUE_CATEGORIES.tableIssues(issue.type),
            ).length,
            data: healthIssues.filter((issue) =>
              APP_HEALTH_ISSUE_CATEGORIES.columnIssues(issue.type),
            ).length,
            relationship: healthIssues.filter((issue) =>
              APP_HEALTH_ISSUE_CATEGORIES.relationIssues(issue.type),
            ).length,
          };

          return {
            workspaceId,
            severity: this.getSeverityLevel(
              issuesSummary,
              pendingMigrations.length,
            ),
            pendingMigrations: pendingMigrations.length,
            issuesSummary,
          };
        }),
      );

      const details = {
        system: {
          nodeVersion: process.version,
        },
        overview: {
          totalWorkspaces: workspaceIds.length,
          criticalWorkspaces: workspaceStats.filter(
            (stat) => stat.severity === 'critical',
          ).length,
          workspacesWithPendingMigrations: workspaceStats.filter(
            (stat) => stat.pendingMigrations > 0,
          ).length,
          healthDistribution: {
            healthy: workspaceStats.filter(
              (stat) => stat.severity === 'healthy',
            ).length,
            warning: workspaceStats.filter(
              (stat) => stat.severity === 'warning',
            ).length,
            critical: workspaceStats.filter(
              (stat) => stat.severity === 'critical',
            ).length,
          },
        },
        problematicWorkspaces: workspaceStats.filter(
          (stat) => stat.severity !== 'healthy',
        ),
      };

      const isHealthy = workspaceStats.every(
        (stat) =>
          (stat.pendingMigrations === 0 && stat.severity === 'healthy') ||
          stat.severity === 'warning',
      );

      return isHealthy
        ? indicator.up({ details })
        : indicator.down({
            errorMessage: 'Pending migrations detected',
          });
    } catch (error) {
      return indicator.down(error);
    }
  }

  private getSeverityLevel(
    issuesSummary: {
      structural: number;
      data: number;
      relationship: number;
    },
    pendingMigrations: number,
  ): 'healthy' | 'warning' | 'critical' {
    if (pendingMigrations > 0) {
      return 'critical';
    }

    if (Object.values(issuesSummary).some((count) => count > 0)) {
      return 'warning';
    }

    return 'healthy';
  }
}
