import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type AgentRunInsightsDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run-insights.dto';
import { type AgentRunSummaryDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run-summary.dto';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { buildRunInsightsDailySeriesQuery } from 'src/engine/utils/run-insights/build-run-insights-daily-series-query.util';
import { RUN_INSIGHTS_WINDOW_IN_DAYS } from 'src/engine/utils/run-insights/run-insights-window-in-days.constant';

const RECENT_RUNS_LIMIT = 10;

type RunSummaryRow = {
  agentId: string;
  runCount: string | number;
  recentRuns: { id: string; status: AgentTurnStatus; createdAt: string }[];
};

type TotalsRow = {
  runCount: string | number;
  tokenCount: string | number;
  internalCredits: string | number;
  averageDurationInMs: string | number | null;
};

type DailyRunCountRow = {
  day: string;
  completedRunCount: string | number;
  failedRunCount: string | number;
  otherRunCount: string | number;
  internalCredits: string | number;
};

const buildInternalCreditsSql = (alias: string) =>
  `COALESCE(SUM(COALESCE("${alias}"."inputCredits", 0) + COALESCE("${alias}"."outputCredits", 0)), 0)`;

@Injectable()
export class AgentRunStatisticsService {
  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
  ) {}

  async findRunSummaries({
    workspaceId,
    agentIds,
  }: {
    workspaceId: string;
    agentIds: string[];
  }): Promise<AgentRunSummaryDTO[]> {
    if (!isNonEmptyArray(agentIds)) {
      return [];
    }

    const rows = await this.turnRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<RunSummaryRow[]>(
          `
          SELECT
            "requestedAgent"."id" AS "agentId",
            "runCount"."runCount" AS "runCount",
            "recentRuns"."recentRuns" AS "recentRuns"
          FROM UNNEST($1::uuid[]) AS "requestedAgent"("id")
          CROSS JOIN LATERAL (
            SELECT COUNT(*) AS "runCount"
            FROM ${table('agentTurn')} AS "agentTurn"
            WHERE "agentTurn"."agentId" = "requestedAgent"."id"
              AND "agentTurn"."createdAt" >= NOW() - MAKE_INTERVAL(days => $2::int)
          ) AS "runCount"
          CROSS JOIN LATERAL (
            SELECT COALESCE(
              JSONB_AGG(
                JSONB_BUILD_OBJECT(
                  'id', "recentRun"."id",
                  'status', "recentRun"."status",
                  'createdAt', "recentRun"."createdAt"
                )
                ORDER BY "recentRun"."createdAt" DESC, "recentRun"."id" DESC
              ),
              '[]'::jsonb
            ) AS "recentRuns"
            FROM (
              SELECT "agentTurn"."id", "agentTurn"."status", "agentTurn"."createdAt"
              FROM ${table('agentTurn')} AS "agentTurn"
              WHERE "agentTurn"."agentId" = "requestedAgent"."id"
              ORDER BY "agentTurn"."createdAt" DESC, "agentTurn"."id" DESC
              LIMIT $3::int
            ) AS "recentRun"
          ) AS "recentRuns"`,
          [agentIds, RUN_INSIGHTS_WINDOW_IN_DAYS, RECENT_RUNS_LIMIT],
        ),
    );

    const rowByAgentId = new Map(rows.map((row) => [row.agentId, row]));

    return agentIds.map((agentId) => {
      const row = rowByAgentId.get(agentId);

      return {
        agentId,
        runCountLast14Days: Number(row?.runCount ?? 0),
        recentRuns: (row?.recentRuns ?? []).map((recentRun) => ({
          ...recentRun,
          createdAt: new Date(recentRun.createdAt),
        })),
      };
    });
  }

  async findRunInsights({
    workspaceId,
    agentId,
    timeZone,
  }: {
    workspaceId: string;
    agentId: string;
    timeZone: string;
  }): Promise<AgentRunInsightsDTO> {
    // Totals share the list's rolling window; the bars need local calendar days

    const [[totals], dailyRunCounts] = await this.turnRepository.query(
      workspaceId,
      ({ manager, table }) =>
        Promise.all([
          manager.query<TotalsRow[]>(
            `
            SELECT
              COUNT(*) AS "runCount",
              COALESCE(SUM(COALESCE("agentTurn"."inputTokens", 0) + COALESCE("agentTurn"."outputTokens", 0)), 0) AS "tokenCount",
              ${buildInternalCreditsSql('agentTurn')} AS "internalCredits",
              AVG(EXTRACT(EPOCH FROM ("agentTurn"."endedAt" - "agentTurn"."startedAt")) * 1000)
                FILTER (WHERE "agentTurn"."status" = $3) AS "averageDurationInMs"
            FROM ${table('agentTurn')} AS "agentTurn"
            WHERE "agentTurn"."agentId" = $1
              AND "agentTurn"."createdAt" >= NOW() - MAKE_INTERVAL(days => $2::int)`,
            [agentId, RUN_INSIGHTS_WINDOW_IN_DAYS, AgentTurnStatus.COMPLETED],
          ),
          manager.query<DailyRunCountRow[]>(
            buildRunInsightsDailySeriesQuery({
              runsSource: table('agentTurn'),
              runsSourceCondition: '"run"."agentId" = $1',
              additionalSelects: [
                `${buildInternalCreditsSql('run')} AS "internalCredits"`,
              ],
              placeholders: {
                timeZone: '$2',
                lastDayOffset: '$3',
                completedStatus: '$4',
                failedStatus: '$5',
              },
            }),
            [
              agentId,
              timeZone,
              RUN_INSIGHTS_WINDOW_IN_DAYS - 1,
              AgentTurnStatus.COMPLETED,
              AgentTurnStatus.FAILED,
            ],
          ),
        ]),
    );

    return {
      agentId,
      runCount: Number(totals?.runCount ?? 0),
      tokenCount: Number(totals?.tokenCount ?? 0),
      credits: toDisplayCredits(Number(totals?.internalCredits ?? 0)),
      averageDurationInMs: isDefined(totals?.averageDurationInMs)
        ? Number(totals.averageDurationInMs)
        : null,
      dailyRunCounts: dailyRunCounts.map((dailyRunCount) => ({
        day: dailyRunCount.day,
        completedRunCount: Number(dailyRunCount.completedRunCount),
        failedRunCount: Number(dailyRunCount.failedRunCount),
        otherRunCount: Number(dailyRunCount.otherRunCount),
        credits: toDisplayCredits(Number(dailyRunCount.internalCredits)),
      })),
    };
  }
}
