import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { AnyFieldSearchChip } from '@/views/components/AnyFieldSearchChip';
import { AnyFieldSearchDropdownContent } from '@/views/components/AnyFieldSearchDropdownContent';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';

export const AnyFieldSearchDropdownButton = () => {
  const { anyFieldSearchDropdownId } = useViewBarFilterDropdownIds();

  const { openDropdown } = useOpenDropdown();

  const handleOpenAnyFieldSearchDropdown = () => {
    openDropdown({
      dropdownComponentInstanceIdFromProps: anyFieldSearchDropdownId,
    });
  };

  return (
    <Dropdown
      dropdownId={anyFieldSearchDropdownId}
      clickableComponent={<AnyFieldSearchChip />}
      dropdownComponents={<AnyFieldSearchDropdownContent />}
      dropdownOffset={{ y: DROPDOWN_OFFSET_Y, x: 0 }}
      dropdownPlacement="bottom-start"
      onOpen={handleOpenAnyFieldSearchDropdown}
    />
  );
};
