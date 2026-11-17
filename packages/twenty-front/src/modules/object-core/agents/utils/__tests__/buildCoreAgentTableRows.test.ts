import { buildCoreAgentTableRows } from '@/object-core/agents/utils/buildCoreAgentTableRows';
import { AgentTurnStatus } from '~/generated-metadata/graphql';

const buildCoreAgent = (id: string) => ({ id });

describe('buildCoreAgentTableRows', () => {
  it('uses the most recent run as the last run', () => {
    const [row] = buildCoreAgentTableRows({
      coreAgents: [buildCoreAgent('with-runs')],
      runSummaries: [
        {
          __typename: 'AgentRunSummary',
          agentId: 'with-runs',
          runCountLast14Days: 42,
          recentRuns: [
            {
              __typename: 'AgentRecentRun',
              id: 'newest',
              status: AgentTurnStatus.FAILED,
              createdAt: '2026-11-10T10:00:00.000Z',
            },
            {
              __typename: 'AgentRecentRun',
              id: 'older',
              status: AgentTurnStatus.COMPLETED,
              createdAt: '2026-11-09T10:00:00.000Z',
            },
          ],
        },
      ],
    });

    expect(row.lastRunAt).toBe('2026-11-10T10:00:00.000Z');
    expect(row.runCountLast14Days).toBe(42);
    expect(row.recentRuns?.map(({ statusColor }) => statusColor)).toEqual([
      'red',
      'green',
    ]);
  });

  it('keeps a real zero for an agent that never ran', () => {
    const [row] = buildCoreAgentTableRows({
      coreAgents: [buildCoreAgent('never-ran')],
      runSummaries: [
        {
          __typename: 'AgentRunSummary',
          agentId: 'never-ran',
          runCountLast14Days: 0,
          recentRuns: [],
        },
      ],
    });

    expect(row.lastRunAt).toBeNull();
    expect(row.runCountLast14Days).toBe(0);
    expect(row.recentRuns).toEqual([]);
  });

  it('leaves run fields empty when runs could not be read', () => {
    const [row] = buildCoreAgentTableRows({
      coreAgents: [buildCoreAgent('unreadable-runs')],
      runSummaries: null,
    });

    expect(row.lastRunAt).toBeNull();
    expect(row.runCountLast14Days).toBeNull();
    expect(row.recentRuns).toBeNull();
  });
});
