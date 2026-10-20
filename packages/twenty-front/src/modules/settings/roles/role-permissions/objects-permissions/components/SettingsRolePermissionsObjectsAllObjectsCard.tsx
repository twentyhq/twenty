import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsRolePermissionsActionSwitchCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsActionSwitchCard';
import { SettingsRolePermissionsObjectAccessSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectAccessSelect';
import { useSetRoleActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSetRoleActionPermissions';
import { type SettingsRoleObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectAccessLevel';
import { getActionPermissionsAfterToggle } from '@/settings/roles/role-permissions/objects-permissions/utils/getActionPermissionsAfterToggle';
import { getActionPermissionsFromObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/utils/getActionPermissionsFromObjectAccessLevel';
import { getObjectAccessLevelFromActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectAccessLevelFromActionPermissions';
import { getRoleActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconDatabase } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled(StyledSettingsSelectGroup)`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const ACCESS_SELECT_CONTROL_WIDTH = 150;

type SettingsRolePermissionsObjectsAllObjectsCardProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsAllObjectsCard = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsObjectsAllObjectsCardProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { setRoleActionPermissions } = useSetRoleActionPermissions(roleId);

  const [isAdvancedSelected, setIsAdvancedSelected] = useState(false);

  const roleActionPermissions = getRoleActionPermissions(settingsDraftRole);

  const accessLevel = getObjectAccessLevelFromActionPermissions(
    roleActionPermissions,
  );

  const showActionSwitches = isAdvancedSelected || accessLevel === 'ADVANCED';

  const handleAccessLevelChange = (
    newAccessLevel: SettingsRoleObjectAccessLevel,
  ) => {
    if (newAccessLevel === 'ADVANCED') {
      setIsAdvancedSelected(true);
      return;
    }

    setIsAdvancedSelected(false);
    setRoleActionPermissions(
      getActionPermissionsFromObjectAccessLevel(newAccessLevel),
    );
  };

  return (
    <StyledContainer controlWidth={ACCESS_SELECT_CONTROL_WIDTH}>
      <Card.Root>
        <SettingsOptionCardContentSelect
          Icon={IconDatabase}
          title={t`All objects`}
          description={t`Applies to all objects before overrides`}
        >
          <SettingsRolePermissionsObjectAccessSelect
            dropdownId="settings-role-permissions-all-objects-access"
            value={showActionSwitches ? 'ADVANCED' : accessLevel}
            disabled={!isEditable}
            onChange={handleAccessLevelChange}
          />
        </SettingsOptionCardContentSelect>
      </Card.Root>
      <Collapsible.Root open={showActionSwitches}>
        <Collapsible.Panel dimension="height">
          <SettingsRolePermissionsActionSwitchCard
            actionPermissions={roleActionPermissions}
            objectLabelPlural={t`records`}
            disabled={!isEditable}
            onToggle={(permissionKey, value) =>
              setRoleActionPermissions(
                getActionPermissionsAfterToggle(
                  roleActionPermissions,
                  permissionKey,
                  value,
                ),
              )
            }
          />
        </Collapsible.Panel>
      </Collapsible.Root>
    </StyledContainer>
  );
};
