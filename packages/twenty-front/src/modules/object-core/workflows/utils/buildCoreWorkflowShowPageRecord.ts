import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type GetCoreWorkflowByIdQuery } from '~/generated/graphql';

export const buildCoreWorkflowShowPageRecord = (
  coreWorkflow: GetCoreWorkflowByIdQuery['coreWorkflowById'] | undefined,
): ObjectRecord | undefined => {
  if (!isDefined(coreWorkflow)) {
    return undefined;
  }

  return {
    __typename: 'Workflow',
    id: coreWorkflow.id,
    coreWorkflowId: coreWorkflow.id,
    workspaceWorkflowId: coreWorkflow.workspaceWorkflowId,
    name: coreWorkflow.name ?? '',
    statuses: coreWorkflow.statuses,
    lastPublishedVersionId: coreWorkflow.lastPublishedVersionId,
    createdAt: coreWorkflow.createdAt,
    updatedAt: coreWorkflow.updatedAt,
    deletedAt: null,
  };
};
