import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowAiAgentObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermissionChange';
import { type WorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermission';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';

const CRUD_PERMISSION_ORDER = CRUD_PERMISSIONS.reduce<
  Record<SettingsRoleObjectPermissionKey, number>
>(
  (orderMap, permission, index) => {
    orderMap[permission.key] = index;
    return orderMap;
  },
  {} as Record<SettingsRoleObjectPermissionKey, number>,
);

type WorkflowAiAgentPermissionListProps = {
  readonly: boolean;
  objectPermissions: WorkflowAiAgentObjectPermission[];
  onDeletePermission?: (change: WorkflowAiAgentObjectPermissionChange) => void;
  searchQuery: string;
};

export const WorkflowAiAgentPermissionList = ({
  readonly,
  objectPermissions,
  onDeletePermission,
  searchQuery,
}: WorkflowAiAgentPermissionListProps) => {
  const { activeObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const allObjectsLabel = t`all objects`;

  const sortedExistingPermissions = objectPermissions
    .reduce<
      Array<{
        objectMetadataId: string | null;
        objectLabel: string;
        permissionKey: SettingsRoleObjectPermissionKey;
        permissionLabel: string;
      }>
    >((permissions, objectPermission) => {
      const objectLabel = isDefined(objectPermission.objectMetadataId)
        ? objectMetadataItems.find(
            (item) => item.id === objectPermission.objectMetadataId,
          )?.labelPlural
        : allObjectsLabel;

      if (!isDefined(objectLabel)) {
        return permissions;
      }

      CRUD_PERMISSIONS.forEach((crud) => {
        if (objectPermission[crud.key] === true) {
          permissions.push({
            objectMetadataId: objectPermission.objectMetadataId,
            objectLabel,
            permissionKey: crud.key,
            permissionLabel: crud.label(objectLabel),
          });
        }
      });

      return permissions;
    }, [])
    .sort((permissionA, permissionB) => {
      if (
        permissionA.objectMetadataId === permissionB.objectMetadataId &&
        permissionA.permissionKey !== permissionB.permissionKey
      ) {
        return (
          CRUD_PERMISSION_ORDER[permissionA.permissionKey] -
          CRUD_PERMISSION_ORDER[permissionB.permissionKey]
        );
      }

      const isPermissionAOnAllObjects = !isDefined(
        permissionA.objectMetadataId,
      );

      if (
        isPermissionAOnAllObjects !== !isDefined(permissionB.objectMetadataId)
      ) {
        return isPermissionAOnAllObjects ? -1 : 1;
      }

      return permissionA.objectLabel.localeCompare(permissionB.objectLabel);
    });

  const filteredPermissions = filterBySearchQuery({
    items: sortedExistingPermissions,
    searchQuery,
    getSearchableValues: (permission) => [
      permission.permissionLabel,
      permission.objectLabel,
    ],
  });

  if (filteredPermissions.length === 0) {
    return null;
  }

  return (
    <SidePanelGroup heading={t`CRUD`}>
      {filteredPermissions.map((permission) => (
        <WorkflowAiAgentPermissionsPermissionRow
          key={`${permission.objectMetadataId}-${permission.permissionKey}`}
          permission={{
            key: permission.permissionKey,
            label: permission.permissionLabel,
          }}
          isEnabled={true}
          readonly={readonly}
          showDeleteButton={!readonly && isDefined(onDeletePermission)}
          onDelete={() =>
            onDeletePermission?.({
              objectMetadataId: permission.objectMetadataId,
              permissionKey: permission.permissionKey,
            })
          }
        />
      ))}
    </SidePanelGroup>
  );
};
