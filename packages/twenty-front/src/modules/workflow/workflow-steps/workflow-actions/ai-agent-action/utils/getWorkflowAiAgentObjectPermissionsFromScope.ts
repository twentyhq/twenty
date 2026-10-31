import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';

export const getWorkflowAiAgentObjectPermissionsFromScope = ({
  scope,
  objectMetadataItems,
}: {
  scope: AiRunScope | undefined;
  objectMetadataItems: { id: string; universalIdentifier: string }[];
}): WorkflowAiAgentCrudObjectPermission[] =>
  (scope?.objectPermissions ?? []).flatMap((objectPermission) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) =>
        item.universalIdentifier === objectPermission.objectUniversalIdentifier,
    );

    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    return [
      {
        objectMetadataId: objectMetadataItem.id,
        canReadObjectRecords: objectPermission.canReadObjectRecords ?? false,
        canUpdateObjectRecords:
          objectPermission.canUpdateObjectRecords ?? false,
        canSoftDeleteObjectRecords:
          objectPermission.canSoftDeleteObjectRecords ?? false,
        canDestroyObjectRecords:
          objectPermission.canDestroyObjectRecords ?? false,
      },
    ];
  });
