import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

type SettingsRolePermissionsProps = {
  roleId: string;
  isEditable: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissions = ({
  roleId,
  isEditable,
  fromAgentId,
}: SettingsRolePermissionsProps) => {
  return (
    <StyledRolePermissionsContainer>
      <SettingsRoleDraftSyncEffect roleId={roleId} />
      <SettingsRolePermissionsObjectsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsObjectLevelSection
        roleId={roleId}
        fromAgentId={fromAgentId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsSettingsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsToolSection
        roleId={roleId}
        isEditable={isEditable}
      />
    </StyledRolePermissionsContainer>
  );
};
