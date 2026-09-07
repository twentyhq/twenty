import { type GetCoreWorkflowsQuery } from '~/generated/graphql';

export type CoreWorkflow =
  GetCoreWorkflowsQuery['coreWorkflows']['edges'][number]['node'];
