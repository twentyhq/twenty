import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { t } from '@lingui/core/macro';
import { type ObjectPermission } from '~/generated/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';
import { StyledLabel, StyledList } from './WorkflowAiAgentPermissionsStyles';

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
  objectPermissions: ObjectPermission[];
  onDeletePermission: (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => void;
  searchQuery: string;
};

export const WorkflowAiAgentPermissionList = ({
  readonly,
  objectPermissions,
  onDeletePermission,
  searchQuery,
}: WorkflowAiAgentPermissionListProps) => {
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const sortedExistingPermissions = objectPermissions
    .reduce<
      Array<{
        objectMetadataId: string;
        objectLabel: string;
        permissionKey: SettingsRoleObjectPermissionKey;
        permissionLabel: string;
      }>
    >((permissions, objectPermission) => {
      const objectMetadata = objectMetadataItems.find(
        (item) => item.id === objectPermission.objectMetadataId,
      );

      if (!objectMetadata) {
        return permissions;
      }

      CRUD_PERMISSIONS.forEach((crud) => {
        if (objectPermission[crud.key] === true) {
          permissions.push({
            objectMetadataId: objectPermission.objectMetadataId,
            objectLabel: objectMetadata.labelPlural,
            permissionKey: crud.key,
            permissionLabel: crud.label(objectMetadata.labelPlural),
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
    <div>
      <StyledLabel>{t`CRUD`}</StyledLabel>
      <StyledList>
        {filteredPermissions.map((permission) => (
          <WorkflowAiAgentPermissionsPermissionRow
            key={`${permission.objectMetadataId}-${permission.permissionKey}`}
            permission={{
              key: permission.permissionKey,
              label: permission.permissionLabel,
            }}
            isEnabled={true}
            readonly={readonly}
            onDelete={() =>
              onDeletePermission(
                permission.objectMetadataId,
                permission.permissionKey,
              )
            }
          />
        ))}
      </StyledList>
    </div>
  );
};
