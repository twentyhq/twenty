import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type ObjectPermission } from '~/generated/graphql';
import { CRUD_PERMISSIONS } from '../constants/WorkflowAiAgentCrudPermissions';
import {
  StyledLabel,
  StyledList,
  StyledText,
} from './WorkflowAiAgentPermissions.styles';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';

const StyledEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
`;

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
};

export const WorkflowAiAgentPermissionList = ({
  readonly,
  objectPermissions,
  onDeletePermission,
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

  return (
    <div>
      <StyledLabel>{t`CRUD`}</StyledLabel>
      {sortedExistingPermissions.length > 0 ? (
        <StyledList>
          {sortedExistingPermissions.map((permission) => (
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
      ) : (
        <StyledList>
          <StyledEmptyState>
            <StyledText>{t`No permissions added yet`}</StyledText>
          </StyledEmptyState>
        </StyledList>
      )}
    </div>
  );
};
