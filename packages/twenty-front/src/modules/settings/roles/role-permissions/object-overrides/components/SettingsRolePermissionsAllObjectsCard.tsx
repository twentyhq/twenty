import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsRolePermissionsObjectOperationsSelect } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOperationsSelect';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { IconHierarchy } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

const ALL_OBJECTS_SELECT_WIDTH = 240;

type SettingsRolePermissionsAllObjectsCardProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsAllObjectsCard = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsAllObjectsCardProps) => {
  const { t } = useLingui();
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const handleChange = (
    selectedOperations: SettingsRoleObjectPermissionKey[],
  ) => {
    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      canReadAllObjectRecords: selectedOperations.includes(
        'canReadObjectRecords',
      ),
      canUpdateAllObjectRecords: selectedOperations.includes(
        'canUpdateObjectRecords',
      ),
      canSoftDeleteAllObjectRecords: selectedOperations.includes(
        'canSoftDeleteObjectRecords',
      ),
      canDestroyAllObjectRecords: selectedOperations.includes(
        'canDestroyObjectRecords',
      ),
    }));
  };

  return (
    <StyledSettingsSelectGroup controlWidth={ALL_OBJECTS_SELECT_WIDTH}>
      <Card.Root>
        <SettingsOptionCardContentSelect
          Icon={IconHierarchy}
          title={t`All objects`}
          description={t`Applies to all objects before overrides`}
        >
          <SettingsRolePermissionsObjectOperationsSelect
            dropdownId={`settings-role-all-objects-actions-${roleId}`}
            selectedOperations={SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
              (operation) =>
                settingsDraftRole[
                  SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
                    operation
                  ]
                ],
            )}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </SettingsOptionCardContentSelect>
      </Card.Root>
    </StyledSettingsSelectGroup>
  );
};
