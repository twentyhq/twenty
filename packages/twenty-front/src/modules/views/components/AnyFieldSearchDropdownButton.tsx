import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { AnyFieldSearchChip } from '@/views/components/AnyFieldSearchChip';
import { AnyFieldSearchDropdownContent } from '@/views/components/AnyFieldSearchDropdownContent';
import { ANY_FIELD_SEARCH_DROPDOWN_ID } from '@/views/constants/AnyFieldSearchDropdownId';

export const AnyFieldSearchDropdownButton = () => {
  const { openDropdown } = useOpenDropdown();

  const handleOpenAnyFieldSearchDropdown = () => {
    openDropdown({
      dropdownComponentInstanceIdFromProps: ANY_FIELD_SEARCH_DROPDOWN_ID,
    });
  };

  return (
    <AnyFieldSearchChip
      dropdown={{
        dropdownId: ANY_FIELD_SEARCH_DROPDOWN_ID,
        dropdownComponents: <AnyFieldSearchDropdownContent />,
        dropdownOffset: { y: DROPDOWN_OFFSET_Y, x: 0 },
        dropdownPlacement: 'bottom-start',
        onOpen: handleOpenAnyFieldSearchDropdown,
      }}
    />
  );
};
