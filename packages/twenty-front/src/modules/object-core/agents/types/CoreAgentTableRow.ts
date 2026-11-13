import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreObjectRecentRun } from '@/object-core/types/CoreObjectRecentRun';

// Run fields are null when the reader cannot see agent runs
export type CoreAgentTableRow = CoreAgent & {
  recentRuns: CoreObjectRecentRun[] | null;
  lastRunAt: string | null;
  runCountLast14Days: number | null;
};
