import { type GetCoreWorkflowsQuery } from '~/generated/graphql';

export type CoreWorkflowRunSummary =
  GetCoreWorkflowsQuery['coreWorkflows']['runSummaries'][number];
