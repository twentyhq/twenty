import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/settings-permissions/components/SettingsRolePermissionsSettingsSection';
import styled from '@emotion/styled';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

type SettingsRolePermissionsProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissions = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsProps) => {
  return (
    <StyledRolePermissionsContainer>
      <SettingsRolePermissionsObjectsSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsObjectLevelSection
        roleId={roleId}
        isEditable={isEditable}
      />
      <SettingsRolePermissionsSettingsSection
        roleId={roleId}
        isEditable={isEditable}
      />
    </StyledRolePermissionsContainer>
  );
};
