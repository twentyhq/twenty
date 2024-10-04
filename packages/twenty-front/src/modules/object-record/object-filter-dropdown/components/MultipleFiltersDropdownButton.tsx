import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useCallback } from 'react';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) => {
  const { resetFilter, setIsObjectFilterDropdownOperandSelectUnfolded } =
    useFilterDropdown();

  const handleDropdownClose = useCallback(() => {
    resetFilter();
    setIsObjectFilterDropdownOperandSelectUnfolded(false);
  }, [resetFilter, setIsObjectFilterDropdownOperandSelectUnfolded]);

  return (
    <Dropdown
      dropdownId={OBJECT_FILTER_DROPDOWN_ID}
      onClose={handleDropdownClose}
      clickableComponent={<MultipleFiltersButton />}
      dropdownComponents={<MultipleFiltersDropdownContent />}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8 }}
    />
  );
};
