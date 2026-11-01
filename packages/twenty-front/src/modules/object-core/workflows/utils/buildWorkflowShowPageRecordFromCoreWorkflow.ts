import { isDefined } from 'twenty-shared/utils';

import { buildWorkflowRecordFromCoreWorkflow } from '@/object-core/workflows/utils/buildWorkflowRecordFromCoreWorkflow';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type GetCoreWorkflowQuery } from '~/generated/graphql';

export const buildWorkflowShowPageRecordFromCoreWorkflow = (
  coreWorkflow: GetCoreWorkflowQuery['coreWorkflow'] | undefined,
): ObjectRecord | undefined => {
  if (!isDefined(coreWorkflow)) {
    return undefined;
  }

  return {
    ...buildWorkflowRecordFromCoreWorkflow(coreWorkflow),
    lastPublishedVersionId: coreWorkflow.lastPublishedCoreWorkflowVersionId,
    createdAt: coreWorkflow.createdAt,
  };
};
