export type CoreWorkflowStatus = 'ACTIVE' | 'DRAFT' | 'DEACTIVATED';

export type CoreWorkflow = {
  id: string;
  name: string | null;
  status: CoreWorkflowStatus;
  applicationName: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: string;
};
