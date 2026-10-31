import { isDefined } from 'twenty-shared/utils';

import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';
import { type ObjectPermission } from '~/generated-metadata/graphql';

export const getWorkflowAiAgentCrudObjectPermission = (
  objectPermission:
    | Pick<
        ObjectPermission,
        | 'canReadObjectRecords'
        | 'canUpdateObjectRecords'
        | 'canSoftDeleteObjectRecords'
        | 'canDestroyObjectRecords'
      >
    | undefined,
):
  | Partial<Omit<WorkflowAiAgentCrudObjectPermission, 'objectMetadataId'>>
  | undefined => {
  if (!isDefined(objectPermission)) {
    return undefined;
  }

  return {
    canReadObjectRecords: objectPermission.canReadObjectRecords ?? undefined,
    canUpdateObjectRecords:
      objectPermission.canUpdateObjectRecords ?? undefined,
    canSoftDeleteObjectRecords:
      objectPermission.canSoftDeleteObjectRecords ?? undefined,
    canDestroyObjectRecords:
      objectPermission.canDestroyObjectRecords ?? undefined,
  };
};
