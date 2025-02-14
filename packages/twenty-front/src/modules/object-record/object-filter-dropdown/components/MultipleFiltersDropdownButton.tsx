import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
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
  const { resetFilterDropdown } = useResetFilterDropdown();

  const handleDropdownClose = useCallback(() => {
    resetFilterDropdown();
  }, [resetFilterDropdown]);

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
