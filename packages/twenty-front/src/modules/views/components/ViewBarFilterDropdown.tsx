import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useSearchFilterOperations } from '@/views/hooks/useSearchFilterOperations';
import { useSearchInputState } from '@/views/hooks/useSearchInputState';

import { OPERAND_DROPDOWN_CLICK_OUTSIDE_ID } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandDropdown';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewBarFilterDropdownContent } from '@/views/components/ViewBarFilterDropdownContent';
import { isDefined } from 'twenty-shared/utils';
import { ViewBarFilterButton } from './ViewBarFilterButton';

type ViewBarFilterDropdownProps = {
  hotkeyScope: HotkeyScope;
};

export const ViewBarFilterDropdown = ({
  hotkeyScope,
}: ViewBarFilterDropdownProps) => {
  const { resetFilterDropdown } = useResetFilterDropdown();
  const { setShowSearchInput } = useSearchInputState(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );
  const { removeEmptySearchFilter } = useSearchFilterOperations();
  const { removeRecordFilter } = useRemoveRecordFilter();

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValueV2(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const handleDropdownClickOutside = () => {
    const recordFilterIsEmpty =
      isDefined(objectFilterDropdownCurrentRecordFilter) &&
      isRecordFilterConsideredEmpty(objectFilterDropdownCurrentRecordFilter);

    if (recordFilterIsEmpty) {
      removeRecordFilter({
        recordFilterId: objectFilterDropdownCurrentRecordFilter.id,
      });
    }

    removeEmptySearchFilter();
  };

  const handleDropdownClose = () => {
    resetFilterDropdown();
    setShowSearchInput(false);
    removeEmptySearchFilter();
  };

  return (
    <Dropdown
      dropdownId={VIEW_BAR_FILTER_DROPDOWN_ID}
      onClose={handleDropdownClose}
      clickableComponent={<ViewBarFilterButton />}
      dropdownComponents={<ViewBarFilterDropdownContent />}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8 }}
      onClickOutside={handleDropdownClickOutside}
      excludedClickOutsideIds={[OPERAND_DROPDOWN_CLICK_OUTSIDE_ID]}
    />
  );
};
