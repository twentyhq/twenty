import { useCallback } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterDropdownContent } from '@/object-record/object-filter-dropdown/components/AdvancedFilterDropdownContent';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';

export const AdvancedFilterDropdownButton = () => {
  const handleDropdownClickOutside = useCallback(() => {}, []);

  const handleDropdownClose = useCallback(() => {
    // setIsObjectFilterDropdownOperandSelectUnfolded(false);
  }, []);

  const removeAdvancedFilter = useCallback(() => {}, []);

  return (
    <Dropdown
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={
        <AdvancedFilterChip onRemove={removeAdvancedFilter} />
      }
      dropdownComponents={<AdvancedFilterDropdownContent />}
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onClickOutside={handleDropdownClickOutside}
      onClose={handleDropdownClose}
    />
  );
};
