import { type GetCoreWorkflowsWithVersionsQuery } from '~/generated/graphql';

type CoreWorkflowWithVersionsQueryNode =
  GetCoreWorkflowsWithVersionsQuery['coreWorkflowsWithVersions'][number];

export type CoreWorkflowVersionMetadata = Pick<
  CoreWorkflowWithVersionsQueryNode['versions'][number],
  'label' | 'status' | 'workspaceWorkflowVersionId' | 'createdAt'
>;

export type CoreWorkflowCurrentVersion = Pick<
  NonNullable<CoreWorkflowWithVersionsQueryNode['currentVersion']>,
  | 'label'
  | 'status'
  | 'workspaceWorkflowVersionId'
  | 'workspaceWorkflowId'
  | 'trigger'
  | 'steps'
  | 'createdAt'
  | 'updatedAt'
>;

export type CoreWorkflowWithVersions = Pick<
  CoreWorkflowWithVersionsQueryNode,
  'name' | 'statuses' | 'lastPublishedVersionId' | 'workspaceWorkflowId'
> & {
  versions: CoreWorkflowVersionMetadata[];
  currentVersion?: CoreWorkflowCurrentVersion | null;
};
