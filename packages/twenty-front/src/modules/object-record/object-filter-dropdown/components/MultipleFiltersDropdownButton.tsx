import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
}: MultipleFiltersDropdownButtonProps) => {
  const { resetFilterDropdown } = useResetFilterDropdown();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const handleDropdownClickOutside = () => {
    const recordFilterIsEmpty =
      isDefined(selectedFilter) &&
      isRecordFilterConsideredEmpty(selectedFilter);

    if (recordFilterIsEmpty) {
      removeRecordFilter({ recordFilterId: selectedFilter.id });
    }
  };

  const handleDropdownClose = () => {
    resetFilterDropdown();
  };

  return (
    <Dropdown
      dropdownId={OBJECT_FILTER_DROPDOWN_ID}
      onClose={handleDropdownClose}
      clickableComponent={<MultipleFiltersButton />}
      dropdownComponents={<MultipleFiltersDropdownContent />}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8 }}
      onClickOutside={handleDropdownClickOutside}
    />
  );
};
