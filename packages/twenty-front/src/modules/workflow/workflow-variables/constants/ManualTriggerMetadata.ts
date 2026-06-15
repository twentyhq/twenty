// Keys for the implicit metadata exposed by manual triggers. Must match the
// runtime payload produced by the server (workflow-trigger.resolver) so variable
// paths like {{trigger._metadata.workspaceMemberId}} resolve at execution time.
export const WORKFLOW_TRIGGER_METADATA_KEY = '_metadata';

export const WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY =
  'workspaceMemberId';
