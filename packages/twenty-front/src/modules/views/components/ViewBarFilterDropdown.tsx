import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBarFilterDropdownContent } from '@/views/components/ViewBarFilterDropdownContent';
import { ViewBarFilterButton } from '@/views/components/ViewBarFilterButton';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarFilterDropdown = () => {
  const { mainDropdownId } = useViewBarFilterDropdownIds();

  const { resetFilterDropdown } = useResetFilterDropdown();
  const { removeRecordFilter } = useRemoveRecordFilter();

  const objectFilterDropdownCurrentRecordFilter = useAtomComponentStateValue(
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
  };

  const handleDropdownClose = () => {
    resetFilterDropdown();
  };

  const handleDropdownOpen = () => {
    resetFilterDropdown();
  };

  return (
    <Dropdown
      dropdownId={mainDropdownId}
      onClose={handleDropdownClose}
      onOpen={handleDropdownOpen}
      clickableComponent={<ViewBarFilterButton />}
      dropdownComponents={<ViewBarFilterDropdownContent />}
      dropdownOffset={{ y: 8 }}
      onClickOutside={handleDropdownClickOutside}
    />
  );
};
