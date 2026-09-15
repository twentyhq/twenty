import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

export type CommandMenuWorkflow = Pick<
  WorkflowWithCurrentVersion,
  'id' | 'statuses' | 'lastPublishedVersionId' | 'currentVersion'
>;

export type CommandMenuWorkflowFromCore = CommandMenuWorkflow & {
  workspaceWorkflowId: string | null;
};
