import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowRunStatus } from '@/workflow/types/Workflow';

export type CoreWorkflowRunListItem = ObjectRecord & {
  name: string | null;
  status: WorkflowRunStatus;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  coreWorkflowVersionId: string | null;
};
