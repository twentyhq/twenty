import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { StyledLabel, StyledList } from './WorkflowAiAgentPermissions.styles';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';

type WorkflowAiAgentPermissionsCrudListProps = {
  permissions: Array<{
    key: SettingsRoleObjectPermissionKey;
    label: string;
  }>;
  objectPermissions?: ObjectPermission;
  readonly: boolean;
  onAddPermission: (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => void;
  onDeletePermission: (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => void;
  objectMetadataId: string;
};

export const WorkflowAiAgentPermissionsCrudList = ({
  permissions,
  objectPermissions,
  readonly,
  onAddPermission,
  onDeletePermission,
  objectMetadataId,
}: WorkflowAiAgentPermissionsCrudListProps) => {
  return (
    <div>
      <StyledLabel>CRUD</StyledLabel>
      <StyledList>
        {permissions.map((permission) => {
          const isEnabled = Boolean(objectPermissions?.[permission.key]);

          return (
            <WorkflowAiAgentPermissionsPermissionRow
              key={permission.key}
              permission={permission}
              isEnabled={isEnabled}
              readonly={readonly}
              showDeleteButton={false}
              alwaysShowGranted={true}
              onAdd={() => {
                void onAddPermission(objectMetadataId, permission.key);
              }}
              onDelete={() => {
                void onDeletePermission(objectMetadataId, permission.key);
              }}
            />
          );
        })}
      </StyledList>
    </div>
  );
};
