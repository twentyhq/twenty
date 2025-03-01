import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';

// TODO: move to dedicated file
interface IssuesByCategory {
  tableIssues?: string[];
  columnIssues?: string[];
  relationIssues?: string[];
}

// not sure if to keep it like this or to move it to the workspace health service
// had to define here because in workspace health service the type is being defined not constants
const TABLE_ISSUES = [
  WorkspaceHealthIssueType.MISSING_TABLE,
  WorkspaceHealthIssueType.TABLE_NAME_SHOULD_BE_CUSTOM,
  WorkspaceHealthIssueType.TABLE_TARGET_TABLE_NAME_NOT_VALID,
  WorkspaceHealthIssueType.TABLE_DATA_SOURCE_ID_NOT_VALID,
  WorkspaceHealthIssueType.TABLE_NAME_NOT_VALID,
];

const COLUMN_ISSUES = [
  WorkspaceHealthIssueType.MISSING_COLUMN,
  WorkspaceHealthIssueType.MISSING_INDEX,
  WorkspaceHealthIssueType.MISSING_FOREIGN_KEY,
  WorkspaceHealthIssueType.MISSING_COMPOSITE_TYPE,
  WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT,
  WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT,
  WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT,
  WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID,
];

const RELATION_ISSUES = [
  WorkspaceHealthIssueType.RELATION_METADATA_NOT_VALID,
  WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_NOT_VALID,
  WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_CONFLICT,
  WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_ON_DELETE_ACTION_CONFLICT,
  WorkspaceHealthIssueType.RELATION_TYPE_NOT_VALID,
];

// TODO: move to dedicated file
const ISSUE_CATEGORIES = {
  tableIssues: (type: WorkspaceHealthIssueType) => TABLE_ISSUES.includes(type),
  columnIssues: (type: WorkspaceHealthIssueType) =>
    COLUMN_ISSUES.includes(type),
  relationIssues: (type: WorkspaceHealthIssueType) =>
    RELATION_ISSUES.includes(type),
} as const;

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

          const issuesByCategory = healthIssues.reduce<IssuesByCategory>(
            (acc, issue) => {
              for (const [category, checkFn] of Object.entries(
                ISSUE_CATEGORIES,
              )) {
                if (checkFn(issue.type)) {
                  acc[category] = acc[category] || [];
                  acc[category].push(issue.message);
                  break;
                }
              }

              return acc;
            },
            {},
          );

          return {
            workspaceId,
            healthSummary: {
              tableIssues: issuesByCategory.tableIssues?.length || 0,
              columnIssues: issuesByCategory.columnIssues?.length || 0,
              relationIssues: issuesByCategory.relationIssues?.length || 0,
              pendingMigrations: pendingMigrations.length,
            },
            details: issuesByCategory,
            oldestPendingMigration: pendingMigrations[0]?.createdAt,
          };
        }),
      );

      const isHealthy = workspaceStats.every(
        (stat) => stat.healthSummary.pendingMigrations === 0,
      );

      const details = {
        system: {
          nodeVersion: process.version,
        },
        workspaces: {
          totalWorkspaces: workspaceIds.length,
          healthStatus: workspaceStats.map((stat) => ({
            workspaceId: stat.workspaceId,
            summary: {
              structuralIssues: stat.healthSummary.tableIssues,
              dataIssues: stat.healthSummary.columnIssues,
              relationshipIssues: stat.healthSummary.relationIssues,
              pendingMigrations: stat.healthSummary.pendingMigrations,
            },
            severity: this.getSeverityLevel(stat.healthSummary),
            details: stat.details,
          })),
        },
      };

      return isHealthy
        ? indicator.up({ details: details })
        : indicator.down({ details: details });
    } catch (error) {
      return indicator.down({
        system: {
          nodeVersion: process.version,
        },
        error: error.stack,
      });
    }
  }

  private getSeverityLevel(summary: {
    tableIssues: number;
    columnIssues: number;
    relationIssues: number;
    pendingMigrations: number;
  }): 'critical' | 'warning' | 'healthy' {
    // return type could be materialized
    if (summary.pendingMigrations > 0 || summary.tableIssues > 0) {
      return 'critical';
    }
    if (summary.columnIssues > 0 || summary.relationIssues > 0) {
      return 'warning';
    }

    return 'healthy';
  }
}
