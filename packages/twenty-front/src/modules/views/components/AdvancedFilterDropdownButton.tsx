import { useCallback } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterViewFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterGroup';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';

interface AdvancedFilterDropdownButtonProps {
  viewBarId: string;
}

export const AdvancedFilterDropdownButton = (
  props: AdvancedFilterDropdownButtonProps,
) => {
  const handleDropdownClickOutside = useCallback(() => {}, []);

  const handleDropdownClose = () => {};

  const removeAdvancedFilter = useCallback(() => {}, []);

  return (
    <Dropdown
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={
        <AdvancedFilterChip onRemove={removeAdvancedFilter} />
      }
      dropdownComponents={
        <AdvancedFilterViewFilterGroup viewBarInstanceId={props.viewBarId} />
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={480}
      onClickOutside={handleDropdownClickOutside}
      onClose={handleDropdownClose}
    />
  );
};
