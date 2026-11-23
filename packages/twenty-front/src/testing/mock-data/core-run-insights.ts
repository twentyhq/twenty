import { type CoreAgentRunInsights } from '@/object-core/agents/types/CoreAgentRunInsights';
import { type CoreWorkflowRunInsights } from '@/object-core/workflows/types/CoreWorkflowRunInsights';

const DAILY_RUN_SEQUENCE = [
  { completed: 4, failed: 0, other: 0, credits: 1.2 },
  { completed: 6, failed: 1, other: 0, credits: 2.4 },
  { completed: 2, failed: 0, other: 1, credits: 0.8 },
  { completed: 0, failed: 0, other: 0, credits: 0 },
  { completed: 8, failed: 2, other: 0, credits: 3.6 },
  { completed: 5, failed: 0, other: 0, credits: 1.9 },
  { completed: 3, failed: 1, other: 1, credits: 1.4 },
];

// Fixed dates keep the chart axis stable across visual test runs
const buildMockDays = () =>
  Array.from({ length: 14 }, (_, index) => {
    const sequence = DAILY_RUN_SEQUENCE[index % DAILY_RUN_SEQUENCE.length];

    return {
      day: `2026-03-${String(index + 1).padStart(2, '0')}`,
      completedRunCount: sequence.completed,
      failedRunCount: sequence.failed,
      otherRunCount: sequence.other,
      credits: sequence.credits,
    };
  });

export const MOCK_CORE_AGENT_RUN_INSIGHTS: CoreAgentRunInsights = {
  __typename: 'AgentRunInsights',
  agentId: '20202020-0000-4000-8000-000000000001',
  runCount: 58,
  tokenCount: 1_284_000,
  credits: 23.4,
  averageDurationInMs: 18_400,
  dailyRunCounts: buildMockDays().map((day) => ({
    __typename: 'AgentDailyRunCount',
    ...day,
  })),
};

export const MOCK_CORE_WORKFLOW_RUN_INSIGHTS: CoreWorkflowRunInsights = {
  __typename: 'CoreWorkflowRunInsights',
  coreWorkflowId: '20202020-0000-4000-8000-000000000002',
  runCount: 58,
  failedRunCount: 8,
  isRunCountLowerBound: false,
  averageDurationInMs: 4_200,
  dailyRunCounts: buildMockDays().map(({ credits: _credits, ...day }) => ({
    __typename: 'CoreWorkflowDailyRunCount',
    ...day,
  })),
  recentFailedRuns: [
    {
      __typename: 'CoreWorkflowFailedRun',
      id: '20202020-0000-4000-8000-000000000003',
      name: 'Enrich new company #57',
      createdAt: '2026-03-14T09:30:00.000Z',
      errorMessage: 'Request to enrichment API timed out',
    },
    {
      __typename: 'CoreWorkflowFailedRun',
      id: '20202020-0000-4000-8000-000000000004',
      name: 'Enrich new company #52',
      createdAt: '2026-03-12T16:05:00.000Z',
      errorMessage: null,
    },
  ],
};
