import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilterOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { type ThemeColor } from 'twenty-ui/theme';

import { SettingsSearchFilterTrigger } from '@/settings/components/SettingsSearchFilterTrigger';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type SettingsApplicationContentObjectFilterOption = {
  universalIdentifier: string;
  label: string;
  icon?: string | null;
  color: ThemeColor;
};

type SettingsApplicationContentObjectFilterProps = {
  options: SettingsApplicationContentObjectFilterOption[];
  selectedObjectUniversalIdentifier: string | null;
  onChange: (objectUniversalIdentifier: string | null) => void;
};

export const SettingsApplicationContentObjectFilter = ({
  options,
  selectedObjectUniversalIdentifier,
  onChange,
}: SettingsApplicationContentObjectFilterProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  return (
    <DropdownRoot
      dropdownId="settings-application-content-object-filter"
      type="picker"
    >
      <SettingsSearchFilterTrigger ariaLabel={t`Filter by object`} />
      <DropdownContent side="bottom" align="end" sideOffset={8}>
        <Dropdown.Section scrollable>
          {options.map((option) => (
            <Dropdown.OptionItem
              key={option.universalIdentifier}
              selected={
                option.universalIdentifier === selectedObjectUniversalIdentifier
              }
              onSelect={() => onChange(option.universalIdentifier)}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(option.icon)}
                  color={option.color}
                />
              }
            >
              {option.label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
        {isDefined(selectedObjectUniversalIdentifier) && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconFilterOff />}
                onClick={() => onChange(null)}
              >{t`Clear filter`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
