import { type GetAgentRunSummariesQuery } from '~/generated-metadata/graphql';

export type CoreAgentRunSummary =
  GetAgentRunSummariesQuery['agentRunSummaries'][number];
