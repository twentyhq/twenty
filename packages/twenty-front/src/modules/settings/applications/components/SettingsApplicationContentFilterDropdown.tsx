import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilterOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

import { useSetApplicationContentFilterValue } from '@/settings/applications/hooks/useSetApplicationContentFilterValue';
import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { type ApplicationContentFilterOption } from '@/settings/applications/types/ApplicationContentFilterOption';
import { SettingsSearchFilterTrigger } from '@/settings/components/SettingsSearchFilterTrigger';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type SettingsApplicationContentFilterDropdownProps = {
  filterKey: ApplicationContentFilterKey;
  options: ApplicationContentFilterOption[];
  selectedUniversalIdentifier: string | null;
};

export const SettingsApplicationContentFilterDropdown = ({
  filterKey,
  options,
  selectedUniversalIdentifier,
}: SettingsApplicationContentFilterDropdownProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const setFilterValue = useSetApplicationContentFilterValue();

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
              onSelect={() =>
                setFilterValue({
                  filterKey,
                  universalIdentifier: option.universalIdentifier,
                })
              }
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
                onClick={() =>
                  setFilterValue({ filterKey, universalIdentifier: null })
                }
              >{t`Clear filter`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
