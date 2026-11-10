import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { type CoreWorkflowRecentRun } from '@/object-core/workflows/types/CoreWorkflowRecentRun';

// Run fields are null when the reader cannot see this workflow's runs
export type CoreWorkflowTableRow = CoreWorkflow & {
  recentRuns: CoreWorkflowRecentRun[] | null;
  lastRunAt: string | null;
  runCountLast14Days: number | null;
  isRunCountLowerBound: boolean;
};
