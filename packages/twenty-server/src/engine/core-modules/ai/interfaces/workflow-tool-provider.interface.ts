import { type ToolSet } from 'ai';

export interface IWorkflowToolProvider {
  generateWorkflowTools(workspaceId: string): ToolSet;
}
