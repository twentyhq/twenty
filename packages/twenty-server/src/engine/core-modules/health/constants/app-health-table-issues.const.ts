import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

export const APP_HEALTH_TABLE_ISSUES = [
  WorkspaceHealthIssueType.MISSING_TABLE,
  WorkspaceHealthIssueType.TABLE_NAME_SHOULD_BE_CUSTOM,
  WorkspaceHealthIssueType.TABLE_TARGET_TABLE_NAME_NOT_VALID,
  WorkspaceHealthIssueType.TABLE_DATA_SOURCE_ID_NOT_VALID,
  WorkspaceHealthIssueType.TABLE_NAME_NOT_VALID,
];
