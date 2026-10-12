import { type GetAgentRunsQuery } from '~/generated-metadata/graphql';

export type CoreAgentRun = GetAgentRunsQuery['agentRuns'][number];
