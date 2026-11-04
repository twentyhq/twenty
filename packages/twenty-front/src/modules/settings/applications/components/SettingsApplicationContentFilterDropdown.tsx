import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilterOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

import { type ApplicationContentFilterOption } from '@/settings/applications/types/ApplicationContentFilterOption';
import { SettingsSearchFilterTrigger } from '@/settings/components/SettingsSearchFilterTrigger';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type SettingsApplicationContentFilterDropdownProps = {
  options: ApplicationContentFilterOption[];
  selectedUniversalIdentifier: string | null;
  onChange: (universalIdentifier: string | null) => void;
};

export const SettingsApplicationContentFilterDropdown = ({
  options,
  selectedUniversalIdentifier,
  onChange,
}: SettingsApplicationContentFilterDropdownProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  return (
    <DropdownRoot
      dropdownId="settings-application-content-filter"
      type="picker"
    >
      <SettingsSearchFilterTrigger />
      <DropdownContent side="bottom" align="end" sideOffset={8}>
        <Dropdown.Section scrollable>
          {options.map((option) => (
            <Dropdown.OptionItem
              key={option.universalIdentifier}
              selected={
                option.universalIdentifier === selectedUniversalIdentifier
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
        {isDefined(selectedUniversalIdentifier) && (
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
