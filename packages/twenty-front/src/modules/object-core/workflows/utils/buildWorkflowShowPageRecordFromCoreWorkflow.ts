import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type GetCoreWorkflowQuery } from '~/generated/graphql';

export const buildWorkflowShowPageRecordFromCoreWorkflow = (
  coreWorkflow: GetCoreWorkflowQuery['coreWorkflow'] | undefined,
): ObjectRecord | undefined => {
  if (!isDefined(coreWorkflow)) {
    return undefined;
  }

  return {
    __typename: 'Workflow',
    id: coreWorkflow.id,
    name: coreWorkflow.name ?? '',
    statuses: coreWorkflow.statuses,
    lastPublishedVersionId: coreWorkflow.lastPublishedCoreWorkflowVersionId,
    visibility: coreWorkflow.visibility,
    canChangeVisibility: coreWorkflow.canChangeVisibility,
    createdAt: coreWorkflow.createdAt,
    updatedAt: coreWorkflow.updatedAt,
    deletedAt: null,
  };
};
