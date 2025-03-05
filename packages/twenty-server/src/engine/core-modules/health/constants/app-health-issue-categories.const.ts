import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

import { APP_HEALTH_COLUMN_ISSUES } from 'src/engine/core-modules/health/constants/app-health-column-issues.const';
import { APP_HEALTH_RELATION_ISSUES } from 'src/engine/core-modules/health/constants/app-health-relation-issues.const';
import { APP_HEALTH_TABLE_ISSUES } from 'src/engine/core-modules/health/constants/app-health-table-issues.const';

export const APP_HEALTH_ISSUE_CATEGORIES = {
  tableIssues: (type: WorkspaceHealthIssueType) =>
    APP_HEALTH_TABLE_ISSUES.includes(type),
  columnIssues: (type: WorkspaceHealthIssueType) =>
    APP_HEALTH_COLUMN_ISSUES.includes(type),
  relationIssues: (type: WorkspaceHealthIssueType) =>
    APP_HEALTH_RELATION_ISSUES.includes(type),
} as const;
