import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { useVectorSearchFilterOperations } from './useVectorSearchFilterOperations';

export const useVectorSearchInputState = (filterDropdownId: string) => {
  const [vectorSearchInputValue, setVectorSearchInputValue] =
    useRecoilComponentStateV2(
      objectFilterDropdownSearchInputComponentState,
      filterDropdownId,
    );

  const { getExistingVectorSearchFilter } = useVectorSearchFilterOperations();

  const setVectorSearchInputValueFromExistingFilter = () => {
    const existingVectorSearchFilter = getExistingVectorSearchFilter();
    if (isDefined(existingVectorSearchFilter)) {
      setVectorSearchInputValue(existingVectorSearchFilter.value);
    }
  };

  return {
    vectorSearchInputValue,
    setVectorSearchInputValue,
    setVectorSearchInputValueFromExistingFilter,
  };
};
