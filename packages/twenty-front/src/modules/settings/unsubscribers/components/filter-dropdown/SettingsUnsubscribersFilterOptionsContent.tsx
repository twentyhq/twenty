import { Dropdown } from 'twenty-ui/components/navigation';

import { type SettingsUnsubscribersFilterOption } from '@/settings/unsubscribers/components/filter-dropdown/types/SettingsUnsubscribersFilterOption';

type SettingsUnsubscribersFilterOptionsContentProps = {
  title: string;
  options: SettingsUnsubscribersFilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export const SettingsUnsubscribersFilterOptionsContent = ({
  title,
  options,
  selectedValue,
  onSelect,
}: SettingsUnsubscribersFilterOptionsContentProps) => {
  return (
    <>
      <Dropdown.Back>{title}</Dropdown.Back>
      <Dropdown.Section>
        {options.map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            selected={selectedValue === option.value}
            onSelect={() => onSelect(option.value)}
          >
            {option.label}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
