import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsRolePermissionsObjectActionsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectActionsSelect';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
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

  const handleChange = (selectedKeys: SettingsRoleObjectPermissionKey[]) => {
    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      canReadAllObjectRecords: selectedKeys.includes('canReadObjectRecords'),
      canUpdateAllObjectRecords: selectedKeys.includes(
        'canUpdateObjectRecords',
      ),
      canSoftDeleteAllObjectRecords: selectedKeys.includes(
        'canSoftDeleteObjectRecords',
      ),
      canDestroyAllObjectRecords: selectedKeys.includes(
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
          <SettingsRolePermissionsObjectActionsSelect
            dropdownId={`settings-role-all-objects-actions-${roleId}`}
            selectedKeys={getGrantedObjectPermissionKeys({
              role: settingsDraftRole,
            })}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </SettingsOptionCardContentSelect>
      </Card.Root>
    </StyledSettingsSelectGroup>
  );
};
