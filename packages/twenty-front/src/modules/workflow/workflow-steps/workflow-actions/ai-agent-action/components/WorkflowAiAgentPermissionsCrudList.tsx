import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { t } from '@lingui/core/macro';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';
import { StyledLabel, StyledList } from './WorkflowAiAgentPermissionsStyles';
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
  objectMetadataId: string;
};

export const WorkflowAiAgentPermissionsCrudList = ({
  permissions,
  objectPermissions,
  readonly,
  onAddPermission,
  objectMetadataId,
}: WorkflowAiAgentPermissionsCrudListProps) => {
  return (
    <div>
      <StyledLabel>{t`CRUD`}</StyledLabel>
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
              onAdd={() => onAddPermission(objectMetadataId, permission.key)}
            />
          );
        })}
      </StyledList>
    </div>
  );
};
