import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { type WorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermission';
import { t } from '@lingui/core/macro';
import { type AiRunScope } from 'twenty-shared/ai';
import {
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
} from 'twenty-shared/application';
import { PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

// rows show the scope as written, not what all objects imply, so removing a row removes exactly that grant
export const getWorkflowAiAgentScopePermissions = ({
  scope,
  objectMetadataItems,
}: {
  scope: AiRunScope | undefined;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'universalIdentifier' | 'labelPlural'
  >[];
}): {
  objectPermissions: WorkflowAiAgentObjectPermission[];
  permissionFlagKeys: string[];
  otherPermissionLabels: string[];
} => {
  const findObjectMetadataItem = (objectUniversalIdentifier: string) =>
    objectMetadataItems.find(
      (item) => item.universalIdentifier === objectUniversalIdentifier,
    );

  const objectPermissions = (scope?.objectPermissions ?? []).flatMap(
    (objectPermission) => {
      const objectMetadataItem = findObjectMetadataItem(
        objectPermission.objectUniversalIdentifier,
      );

      return isDefined(objectMetadataItem)
        ? [{ ...objectPermission, objectMetadataItem }]
        : [];
    },
  );

  const deniedPermissionLabels = objectPermissions.flatMap(
    ({ objectMetadataItem, ...objectPermission }) =>
      CRUD_PERMISSIONS.filter(({ key }) => objectPermission[key] === false).map(
        ({ label }) => {
          const permissionLabel = label(objectMetadataItem.labelPlural);

          return t`${permissionLabel} (denied)`;
        },
      ),
  );

  const fieldPermissionLabels = [
    ...new Set(
      (scope?.fieldPermissions ?? []).map(
        ({ objectUniversalIdentifier }) =>
          findObjectMetadataItem(objectUniversalIdentifier)?.labelPlural,
      ),
    ),
  ]
    .filter(isDefined)
    .map((objectLabel) => t`Field permissions on ${objectLabel}`);

  return {
    objectPermissions: [
      {
        objectMetadataId: null,
        ...Object.fromEntries(
          OBJECT_PERMISSION_ACTIONS.map((action) => [
            action,
            scope?.[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]],
          ]),
        ),
      },
      ...objectPermissions.map(
        ({ objectMetadataItem, ...objectPermission }) => ({
          ...objectPermission,
          objectMetadataId: objectMetadataItem.id,
        }),
      ),
    ],
    permissionFlagKeys: (scope?.permissionFlagUniversalIdentifiers ?? [])
      .map((universalIdentifier) =>
        PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier),
      )
      .filter(isDefined),
    otherPermissionLabels: [
      ...(scope?.canUpdateAllSettings ? [t`All settings`] : []),
      ...(scope?.canAccessAllTools ? [t`All tools`] : []),
      ...deniedPermissionLabels,
      ...fieldPermissionLabels,
    ],
  };
};
