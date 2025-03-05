import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

export const APP_HEALTH_RELATION_ISSUES = [
  WorkspaceHealthIssueType.RELATION_METADATA_NOT_VALID,
  WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_NOT_VALID,
  WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_CONFLICT,
  WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_ON_DELETE_ACTION_CONFLICT,
  WorkspaceHealthIssueType.RELATION_TYPE_NOT_VALID,
];
