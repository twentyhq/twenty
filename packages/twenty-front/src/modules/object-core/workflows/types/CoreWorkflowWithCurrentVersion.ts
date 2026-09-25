import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { type WorkflowVisibility } from '~/generated/graphql';

export type CoreWorkflowWithCurrentVersion = WorkflowWithCurrentVersion & {
  visibility: WorkflowVisibility;
  canChangeVisibility: boolean;
};
