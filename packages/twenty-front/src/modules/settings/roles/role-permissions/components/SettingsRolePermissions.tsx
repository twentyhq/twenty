import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

type SettingsRolePermissionsProps = {
  roleId: string;
  isEditable: boolean;
  fromAgentId?: string;
  objectMetadataItemsFromMarketplaceApp?: ObjectMetadataItem[];
};

export const SettingsRolePermissions = ({
  roleId,
  isEditable,
  fromAgentId,
  objectMetadataItemsFromMarketplaceApp,
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
        isEditable={isEditable}
        objectMetadataItemsFromMarketplaceApp={
          objectMetadataItemsFromMarketplaceApp
        }
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
