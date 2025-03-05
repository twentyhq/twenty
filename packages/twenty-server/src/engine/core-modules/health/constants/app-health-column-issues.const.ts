import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

export const APP_HEALTH_COLUMN_ISSUES = [
  WorkspaceHealthIssueType.MISSING_COLUMN,
  WorkspaceHealthIssueType.MISSING_INDEX,
  WorkspaceHealthIssueType.MISSING_FOREIGN_KEY,
  WorkspaceHealthIssueType.MISSING_COMPOSITE_TYPE,
  WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT,
  WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT,
  WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT,
  WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID,
];
