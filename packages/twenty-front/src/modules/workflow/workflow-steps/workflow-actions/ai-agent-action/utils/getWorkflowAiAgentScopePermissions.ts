import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermission';
import { type AiRunScope } from 'twenty-shared/ai';
import {
  OBJECT_PERMISSION_ACTIONS,
  resolveObjectPermissionValue,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
} from 'twenty-shared/application';
import { PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const getWorkflowAiAgentScopePermissions = ({
  scope,
  objectMetadataItems,
}: {
  scope: AiRunScope | undefined;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'universalIdentifier' | 'isSystem'
  >[];
}): {
  objectPermissions: WorkflowAiAgentObjectPermission[];
  permissionFlagKeys: string[];
} => {
  const getAllObjectsValue = (
    action: (typeof OBJECT_PERMISSION_ACTIONS)[number],
  ) => scope?.[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]] ?? false;

  const allObjectsPermission: WorkflowAiAgentObjectPermission = {
    objectMetadataId: null,
    ...Object.fromEntries(
      OBJECT_PERMISSION_ACTIONS.map((action) => [
        action,
        getAllObjectsValue(action),
      ]),
    ),
  };

  const objectPermissions = (scope?.objectPermissions ?? []).flatMap(
    (objectPermission): WorkflowAiAgentObjectPermission[] => {
      const objectMetadataItem = objectMetadataItems.find(
        (item) =>
          item.universalIdentifier ===
          objectPermission.objectUniversalIdentifier,
      );

      if (!isDefined(objectMetadataItem)) {
        return [];
      }

      return [
        {
          objectMetadataId: objectMetadataItem.id,
          ...Object.fromEntries(
            OBJECT_PERMISSION_ACTIONS.map((action) => [
              action,
              resolveObjectPermissionValue({
                objectValue: objectPermission[action],
                allObjectsValue: getAllObjectsValue(action),
                isSystemObject: objectMetadataItem.isSystem,
              }),
            ]),
          ),
        },
      ];
    },
  );

  return {
    objectPermissions: [allObjectsPermission, ...objectPermissions],
    permissionFlagKeys: (scope?.permissionFlagUniversalIdentifiers ?? [])
      .map((universalIdentifier) =>
        PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier),
      )
      .filter(isDefined),
  };
};
