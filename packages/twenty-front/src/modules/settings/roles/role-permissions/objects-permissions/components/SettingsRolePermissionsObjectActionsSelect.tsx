import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { getObjectPermissionActionLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionLabel';
import { getObjectPermissionActionsLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionsLabel';
import { getObjectPermissionKeysWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionKeysWithReadDependency';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconAdjustments, IconEyeOff } from 'twenty-ui/icon';

type SettingsRolePermissionsObjectActionsSelectProps = {
  dropdownId: string;
  selectedKeys: SettingsRoleObjectPermissionKey[];
  onChange: (selectedKeys: SettingsRoleObjectPermissionKey[]) => void;
  disabled?: boolean;
};

export const SettingsRolePermissionsObjectActionsSelect = ({
  dropdownId,
  selectedKeys,
  onChange,
  disabled = false,
}: SettingsRolePermissionsObjectActionsSelectProps) => {
  const { t } = useLingui();

  const highestSelectedKey = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (key) => selectedKeys.includes(key),
  ).at(-1);

  const selectControl = (
    <MultiSelectControl
      selectedOptions={[]}
      fixedIcon={
        selectedKeys.length === 0
          ? IconEyeOff
          : selectedKeys.length > 1
            ? IconAdjustments
            : SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[
                highestSelectedKey ?? 'canReadObjectRecords'
              ].Icon
      }
      fixedText={getObjectPermissionActionsLabel(selectedKeys)}
      isDisabled={disabled}
      selectSizeVariant="small"
    />
  );

  if (disabled) {
    return selectControl;
  }

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        {selectControl}
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.Medium}
        align="end"
        aria-label={t`Allowed actions`}
      >
        <Dropdown.SelectionGroup
          aria-label={t`Allowed actions`}
          multiple
          value={selectedKeys}
          onValueChange={(nextSelectedValues) =>
            onChange(
              getObjectPermissionKeysWithReadDependency({
                previousKeys: selectedKeys,
                nextKeys: SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter((key) =>
                  nextSelectedValues.includes(key),
                ),
              }),
            )
          }
        >
          <Dropdown.Section>
            {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => (
              <Dropdown.OptionItem
                key={key}
                value={key}
                startIcon={
                  <SelectOptionIcon
                    Icon={SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].Icon}
                  />
                }
              >
                {getObjectPermissionActionLabel(key)}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};
