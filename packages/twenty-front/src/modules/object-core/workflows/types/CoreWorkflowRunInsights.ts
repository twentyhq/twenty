import { type GetCoreWorkflowRunInsightsQuery } from '~/generated/graphql';

export type CoreWorkflowRunInsights = NonNullable<
  GetCoreWorkflowRunInsightsQuery['coreWorkflowRunInsights']
>;
