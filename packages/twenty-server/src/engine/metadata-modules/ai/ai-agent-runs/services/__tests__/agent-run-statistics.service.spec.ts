import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { AgentRunStatisticsService } from 'src/engine/metadata-modules/ai/ai-agent-runs/services/agent-run-statistics.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const buildService = (queryResults: unknown[][]) => {
  const manager = { query: jest.fn() };

  queryResults.forEach((queryResult) =>
    manager.query.mockResolvedValueOnce(queryResult),
  );

  const turnRepository = {
    query: jest.fn(
      (
        _workspaceId: string,
        work: (context: {
          manager: typeof manager;
          table: (name: string) => string;
        }) => unknown,
      ) => work({ manager, table: (name) => `"workspace"."${name}"` }),
    ),
  };

  return {
    service: new AgentRunStatisticsService(turnRepository as never),
    manager,
  };
};

describe('AgentRunStatisticsService', () => {
  describe('findRunSummaries', () => {
    it('does not query when no agent is requested', async () => {
      const { service, manager } = buildService([]);

      await expect(
        service.findRunSummaries({ workspaceId: 'workspace', agentIds: [] }),
      ).resolves.toEqual([]);
      expect(manager.query).not.toHaveBeenCalled();
    });

    it('returns one summary per requested agent, in the requested order', async () => {
      const { service } = buildService([
        [
          {
            agentId: 'agent-b',
            runCount: '3',
            recentRuns: [
              {
                id: 'turn-1',
                status: AgentTurnStatus.FAILED,
                createdAt: '2026-11-10T10:00:00+00:00',
              },
            ],
          },
        ],
      ]);

      await expect(
        service.findRunSummaries({
          workspaceId: 'workspace',
          agentIds: ['agent-a', 'agent-b'],
        }),
      ).resolves.toEqual([
        { agentId: 'agent-a', runCountLast14Days: 0, recentRuns: [] },
        {
          agentId: 'agent-b',
          runCountLast14Days: 3,
          recentRuns: [
            {
              id: 'turn-1',
              status: AgentTurnStatus.FAILED,
              createdAt: new Date('2026-11-10T10:00:00.000Z'),
            },
          ],
        },
      ]);
    });
  });

  describe('findRunInsights', () => {
    it('converts database aggregates to numbers', async () => {
      const { service } = buildService([
        [
          {
            runCount: '12',
            tokenCount: '4200',
            internalCredits: '2500',
            averageDurationInMs: '1500.5',
          },
        ],
        [
          {
            day: '2026-11-10',
            completedRunCount: '4',
            failedRunCount: '1',
            otherRunCount: '0',
            internalCredits: '1000',
          },
        ],
      ]);

      await expect(
        service.findRunInsights({
          workspaceId: 'workspace',
          agentId: 'agent-a',
          timeZone: 'Europe/Paris',
        }),
      ).resolves.toEqual({
        agentId: 'agent-a',
        runCount: 12,
        tokenCount: 4200,
        credits: toDisplayCredits(2500),
        averageDurationInMs: 1500.5,
        dailyRunCounts: [
          {
            day: '2026-11-10',
            completedRunCount: 4,
            failedRunCount: 1,
            otherRunCount: 0,
            credits: toDisplayCredits(1000),
          },
        ],
      });
    });

    it('has no average duration when no run completed', async () => {
      const { service } = buildService([
        [
          {
            runCount: '0',
            tokenCount: '0',
            internalCredits: '0',
            averageDurationInMs: null,
          },
        ],
        [],
      ]);

      const insights = await service.findRunInsights({
        workspaceId: 'workspace',
        agentId: 'agent-a',
        timeZone: 'UTC',
      });

      expect(insights.runCount).toBe(0);
      expect(insights.averageDurationInMs).toBeNull();
    });
  });
});
