import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type GetCoreWorkflowQuery } from '~/generated/graphql';

export const buildWorkflowShowPageRecordFromCoreWorkflow = (
  coreWorkflow: GetCoreWorkflowQuery['coreWorkflow'] | undefined,
): ObjectRecord | undefined => {
  if (
    !isDefined(coreWorkflow) ||
    !isDefined(coreWorkflow.workspaceWorkflowId)
  ) {
    return undefined;
  }

  return {
    __typename: 'Workflow',
    id: coreWorkflow.workspaceWorkflowId,
    name: coreWorkflow.name ?? '',
    statuses: coreWorkflow.statuses,
    lastPublishedVersionId: coreWorkflow.lastPublishedVersionId,
    createdAt: coreWorkflow.createdAt,
    updatedAt: coreWorkflow.updatedAt,
    deletedAt: null,
  };
};
