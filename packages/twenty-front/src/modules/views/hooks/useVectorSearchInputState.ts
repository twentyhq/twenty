import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';
import { isDefined } from 'twenty-shared/utils';
import { useVectorSearchFilterState } from './useVectorSearchFilterState';

export const useVectorSearchInputState = (filterDropdownId: string) => {
  const [vectorSearchInputValue, setVectorSearchInputValue] =
    useRecoilComponentStateV2(
      vectorSearchInputComponentState,
      filterDropdownId,
    );

  const { getExistingVectorSearchFilter } = useVectorSearchFilterState();

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
