import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared/utils';

export const useViewBarFilterHotKeys = () => {
  const setShowSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const [searchInputValue, setSearchInputValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);

  useGlobalHotkeys(
    'ctrl+f,meta+f',
    () => {
      const existingSearchFilter = currentRecordFilters.find(
        (filter) => filter.operand === ViewFilterOperand.Search,
      );

      if (!searchInputValue && isDefined(existingSearchFilter)) {
        setSearchInputValue(existingSearchFilter.value);
      }

      openDropdown();
      setShowSearchInput(true);
    },
    true,
    AppHotkeyScope.ViewBarFilter,
    [
      openDropdown,
      setShowSearchInput,
      setSearchInputValue,
      searchInputValue,
      currentRecordFilters,
    ],
  );
};
