import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useVectorSearchFilterActions } from '@/views/hooks/useVectorSearchFilterActions';

import { OPERAND_DROPDOWN_CLICK_OUTSIDE_ID } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandDropdown';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewBarFilterDropdownContent } from '@/views/components/ViewBarFilterDropdownContent';
import { isDefined } from 'twenty-shared/utils';
import { ViewBarFilterButton } from './ViewBarFilterButton';

export const ViewBarFilterDropdown = () => {
  const { resetFilterDropdown } = useResetFilterDropdown();
  const { removeEmptyVectorSearchFilter } = useVectorSearchFilterActions();
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

    removeEmptyVectorSearchFilter();
  };

  const handleDropdownClose = () => {
    resetFilterDropdown();
    removeEmptyVectorSearchFilter();
  };

  const handleDropdownOpen = () => {
    resetFilterDropdown();
  };

  return (
    <Dropdown
      dropdownId={VIEW_BAR_FILTER_DROPDOWN_ID}
      onClose={handleDropdownClose}
      onOpen={handleDropdownOpen}
      clickableComponent={<ViewBarFilterButton />}
      dropdownComponents={<ViewBarFilterDropdownContent />}
      dropdownOffset={{ y: 8 }}
      onClickOutside={handleDropdownClickOutside}
      excludedClickOutsideIds={[OPERAND_DROPDOWN_CLICK_OUTSIDE_ID]}
    />
  );
};
