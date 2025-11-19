import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import styled from '@emotion/styled';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
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
      <SettingsRolePermissionsObjectsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsObjectLevelSection
        roleId={roleId}
        fromAgentId={fromAgentId}
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
