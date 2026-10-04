// Referenced by @WasIntroducedInUpgrade on WorkflowStepWaitEntity so upgrade
// steps running below 2.46.0 don't query the table before this command creates it.
export const CREATE_WORKFLOW_STEP_WAIT_TABLE_UPGRADE_COMMAND_NAME =
  '2.46.0_CreateWorkflowStepWaitTableFastInstanceCommand_1791121482790';
