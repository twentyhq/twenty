import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { useSearchFilterOperations } from './useSearchFilterOperations';

export const useSearchInputState = (filterDropdownId: string) => {
  const [, setShowSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    filterDropdownId,
  );

  const [searchInputValue, setSearchInputValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    filterDropdownId,
  );

  const { getExistingSearchFilter } = useSearchFilterOperations();

  const setSearchInputValueFromExistingFilter = () => {
    const existingSearchFilter = getExistingSearchFilter();
    if (isDefined(existingSearchFilter)) {
      setSearchInputValue(existingSearchFilter.value);
    }
  };

  return {
    searchInputValue,
    setSearchInputValue,
    setShowSearchInput,
    setSearchInputValueFromExistingFilter,
  };
};
