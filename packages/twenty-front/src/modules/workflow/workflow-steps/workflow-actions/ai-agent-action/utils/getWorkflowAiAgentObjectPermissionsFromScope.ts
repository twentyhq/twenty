import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';
import { getWorkflowAiAgentEffectiveObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentEffectiveObjectPermission';

export const getWorkflowAiAgentObjectPermissionsFromScope = ({
  scope,
  objectMetadataItems,
}: {
  scope: AiRunScope | undefined;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'universalIdentifier'
  >[];
}): WorkflowAiAgentCrudObjectPermission[] =>
  (scope?.objectPermissions ?? []).flatMap((objectPermission) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) =>
        item.universalIdentifier === objectPermission.objectUniversalIdentifier,
    );

    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    const isGranted = (
      permissionKey: Parameters<
        typeof getWorkflowAiAgentEffectiveObjectPermission
      >[0]['permissionKey'],
    ) =>
      getWorkflowAiAgentEffectiveObjectPermission({
        scope,
        objectPermission,
        permissionKey,
      });

    return [
      {
        objectMetadataId: objectMetadataItem.id,
        canReadObjectRecords: isGranted('canReadObjectRecords'),
        canUpdateObjectRecords: isGranted('canUpdateObjectRecords'),
        canSoftDeleteObjectRecords: isGranted('canSoftDeleteObjectRecords'),
        canDestroyObjectRecords: isGranted('canDestroyObjectRecords'),
      },
    ];
  });
