// Referenced by @WasIntroducedInUpgrade on WorkflowVersionEntity so upgrade
// steps running below 2.20.0 don't query the table before this command creates it.
export const CREATE_WORKFLOW_VERSION_CORE_TABLE_UPGRADE_COMMAND_NAME =
  '2.20.0_CreateWorkflowVersionCoreTableFastInstanceCommand_1783512000000';
