import { type CoreWorkflowStatus } from '@/object-core/workflows/types/CoreWorkflowStatus';

export type CoreWorkflow = {
  id: string;
  name: string | null;
  status: CoreWorkflowStatus;
  applicationName: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: string;
};
