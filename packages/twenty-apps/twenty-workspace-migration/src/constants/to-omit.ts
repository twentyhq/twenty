export const fieldsToOmit = ['id', 'position', 'searchVector', 'timelineActivities', 'attachments', 'noteTargets', 'taskTargets'];
export const objectsToOmit = ['workflow', 'workflowRun', 'workflowVersion', 'workflowAutomatedTrigger', 'timelineActivity'];
export const objectsToOmitFromCounting = ['workflows', 'workflowRuns', 'workflowVersions', 'workflowAutomatedTriggers', 'timelineActivities', 'workspaceMembers', 'dashboards', 'attachments'];
export const objectsToOmitFromRecordMigration = ['workspaceMember', 'dashboard', 'attachment'];
export const fieldsToOmitFromRecordMigration = ['createdBy', 'updatedBy', 'deletedAt', 'searchVector', 'timelineActivities', 'attachments', 'noteTargets', 'taskTargets'];
export const sourceAppsToOmit = ['OAUTH_ONLY', 'LOCAL'];
export const applicationsToOmit = [
  '' // last contact app
]; // uuids of applications which data should not be transferred as they're generated automatically
