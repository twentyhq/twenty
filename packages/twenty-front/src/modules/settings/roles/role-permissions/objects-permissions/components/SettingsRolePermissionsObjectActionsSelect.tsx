import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { getObjectOperationsSummary } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperationsSummary';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperationsWithReadDependency';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';

type SettingsRolePermissionsObjectActionsSelectProps = {
  dropdownId: string;
  selectedOperations: SettingsRoleObjectPermissionKey[];
  onChange: (selectedOperations: SettingsRoleObjectPermissionKey[]) => void;
  disabled?: boolean;
};

export const SettingsRolePermissionsObjectActionsSelect = ({
  dropdownId,
  selectedOperations,
  onChange,
  disabled = false,
}: SettingsRolePermissionsObjectActionsSelectProps) => {
  const { t } = useLingui();

  const { label, Icon } = getObjectOperationsSummary({
    operations: selectedOperations,
    isAdvanced: selectedOperations.length > 1,
  });

  const selectControl = (
    <MultiSelectControl
      selectedOptions={[]}
      fixedIcon={Icon}
      fixedText={label}
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
          value={selectedOperations}
          onValueChange={(nextSelectedValues) =>
            onChange(
              getObjectOperationsWithReadDependency({
                previousOperations: selectedOperations,
                nextOperations: SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
                  (key) => nextSelectedValues.includes(key),
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
                {t(SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].label)}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};
