import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

export type CommandMenuWorkflow = Pick<
  WorkflowWithCurrentVersion,
  'id' | 'statuses' | 'lastPublishedVersionId' | 'currentVersion'
>;
