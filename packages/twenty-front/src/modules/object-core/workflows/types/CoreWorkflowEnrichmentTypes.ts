import { type GetCoreWorkflowsWithCurrentVersionQuery } from '~/generated/graphql';

type CoreWorkflowWithCurrentVersionQueryNode =
  GetCoreWorkflowsWithCurrentVersionQuery['coreWorkflowsWithCurrentVersion'][number];

export type CoreWorkflowCurrentVersion = Pick<
  NonNullable<CoreWorkflowWithCurrentVersionQueryNode['currentVersion']>,
  | 'label'
  | 'status'
  | 'workspaceWorkflowVersionId'
  | 'workspaceWorkflowId'
  | 'trigger'
  | 'steps'
  | 'createdAt'
  | 'updatedAt'
>;

export type CoreWorkflowWithCurrentVersion = Pick<
  CoreWorkflowWithCurrentVersionQueryNode,
  'statuses' | 'lastPublishedVersionId' | 'workspaceWorkflowId'
> & {
  currentVersion?: CoreWorkflowCurrentVersion | null;
};
