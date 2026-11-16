import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { type CoreObjectRecentRun } from '@/object-core/types/CoreObjectRecentRun';

// Run fields are null when the reader cannot see this workflow's runs
export type CoreWorkflowTableRow = CoreWorkflow & {
  recentRuns: CoreObjectRecentRun[] | null;
  lastRunAt: string | null;
  runCountLast14Days: number | null;
  isRunCountLowerBound: boolean;
};
