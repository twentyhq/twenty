export const fieldsToOmit = ['id', 'position', 'searchVector', 'timelineActivities', 'attachments', 'noteTargets', 'taskTargets'];
export const objectsToOmit = ['workflow', 'workflowRun', 'workflowVersion', 'workflowAutomatedTrigger', 'timelineActivity'];
// attachment: its records point at an actual uploaded file, which is stored workspace-scoped
// server-side - a plain copy of the row would carry a file reference that doesn't exist in the
// target workspace's storage. migrateAttachments downloads each file's bytes from the source
// workspace and re-uploads them into the target workspace before creating the record.
export const objectsToOmitFromRecordMigration = ['workspaceMember', 'dashboard', 'attachment'];
export const fieldsToOmitFromRecordMigration = ['createdBy', 'updatedBy', 'deletedAt', 'searchVector', 'timelineActivities', 'attachments', 'noteTargets', 'taskTargets'];
export const sourceAppsToOmit = ['OAUTH_ONLY', 'LOCAL'];
export const applicationsToOmit = [
  '' // last contact app
]; // uuids of applications which data should not be transferred as they're generated automatically
