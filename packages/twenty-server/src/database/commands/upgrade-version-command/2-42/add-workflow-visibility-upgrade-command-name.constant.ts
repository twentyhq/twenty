// Referenced by @WasIntroducedInUpgrade on the core workflow visibility
// columns so pre-2.42 upgrade steps don't SELECT them before this command
// creates them.
export const ADD_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME =
  '2.42.0_AddWorkflowVisibilityFastInstanceCommand_1789893300000';
