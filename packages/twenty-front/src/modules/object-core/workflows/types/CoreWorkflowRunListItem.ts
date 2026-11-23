import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowRun } from '@/workflow/types/Workflow';

export type CoreWorkflowRunListItem = ObjectRecord &
  Pick<
    WorkflowRun,
    'name' | 'status' | 'createdAt' | 'endedAt' | 'coreWorkflowVersionId'
  > & {
    startedAt: string | null;
  };
