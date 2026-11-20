import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { getObjectOperationsSummary } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsSummary';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsWithReadDependency';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type SettingsRolePermissionsObjectOperationsSelectProps = {
  dropdownId: string;
  selectedOperations: SettingsRoleObjectPermissionKey[];
  onChange: (selectedOperations: SettingsRoleObjectPermissionKey[]) => void;
  disabled?: boolean;
  disabledOperationReasons?: Partial<
    Record<SettingsRoleObjectPermissionKey, string>
  >;
};

export const SettingsRolePermissionsObjectOperationsSelect = ({
  dropdownId,
  selectedOperations,
  onChange,
  disabled = false,
  disabledOperationReasons = {},
}: SettingsRolePermissionsObjectOperationsSelectProps) => {
  const { t } = useLingui();

  const disabledOperations = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter(
    (operation) => isDefined(disabledOperationReasons[operation]),
  );

  const enabledSelectedOperations = selectedOperations.filter(
    (operation) => !disabledOperations.includes(operation),
  );

  const { label, Icon } = getObjectOperationsSummary({
    operations: enabledSelectedOperations,
    isAdvanced: enabledSelectedOperations.length > 1,
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
        width={GenericDropdownContentWidth.ExtraLarge}
        align="end"
        aria-label={t`Allowed actions`}
      >
        <Dropdown.SelectionGroup
          aria-label={t`Allowed actions`}
          multiple
          value={enabledSelectedOperations}
          onValueChange={(nextSelectedValues) =>
            onChange(
              getObjectOperationsWithReadDependency({
                previousOperations: enabledSelectedOperations,
                disabledOperations,
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
                disabled={disabledOperations.includes(key)}
                description={disabledOperationReasons[key]}
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
