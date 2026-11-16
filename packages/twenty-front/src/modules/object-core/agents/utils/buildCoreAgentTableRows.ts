import { isDefined } from 'twenty-shared/utils';

import { type CoreAgentRunSummary } from '@/object-core/agents/types/CoreAgentRunSummary';
import { type CoreAgentTableRow } from '@/object-core/agents/types/CoreAgentTableRow';
import { getCoreAgentRunStatusLabelAndColor } from '@/object-core/agents/utils/getCoreAgentRunStatusLabelAndColor';

type CoreAgentRunFields = Pick<
  CoreAgentTableRow,
  'recentRuns' | 'lastRunAt' | 'runCountLast14Days'
>;

export const buildCoreAgentTableRows = <TCoreAgent extends { id: string }>({
  coreAgents,
  runSummaries,
}: {
  coreAgents: TCoreAgent[];
  runSummaries: CoreAgentRunSummary[] | null;
}): (TCoreAgent & CoreAgentRunFields)[] => {
  const runSummaryByAgentId = new Map(
    (runSummaries ?? []).map((runSummary) => [runSummary.agentId, runSummary]),
  );

  return coreAgents.map((coreAgent) => {
    const runSummary = runSummaryByAgentId.get(coreAgent.id);

    if (!isDefined(runSummary)) {
      return {
        ...coreAgent,
        recentRuns: null,
        lastRunAt: null,
        runCountLast14Days: null,
      };
    }

    return {
      ...coreAgent,
      recentRuns: runSummary.recentRuns.map((recentRun) => {
        const { label, color } = getCoreAgentRunStatusLabelAndColor(
          recentRun.status,
        );

        return {
          id: recentRun.id,
          createdAt: recentRun.createdAt,
          statusLabel: label,
          statusColor: color,
        };
      }),
      lastRunAt: runSummary.recentRuns[0]?.createdAt ?? null,
      runCountLast14Days: runSummary.runCountLast14Days,
    };
  });
};
