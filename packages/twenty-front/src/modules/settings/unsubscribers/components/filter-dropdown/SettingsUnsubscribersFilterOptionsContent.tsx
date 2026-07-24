import { IconChevronLeft } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { type SettingsUnsubscribersFilterOption } from '@/settings/unsubscribers/components/filter-dropdown/types/SettingsUnsubscribersFilterOption';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type SettingsUnsubscribersFilterOptionsContentProps = {
  title: string;
  options: SettingsUnsubscribersFilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export const SettingsUnsubscribersFilterOptionsContent = ({
  title,
  options,
  selectedValue,
  onSelect,
  onBack,
}: SettingsUnsubscribersFilterOptionsContentProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleSelect = (value: string) => {
    onSelect(value);
    closeDropdown();
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {title}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {options.map((option) => (
          <MenuItemSelect
            key={option.value}
            text={option.label}
            selected={selectedValue === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
