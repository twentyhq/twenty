import { useMemo } from 'react';

import { useFilter } from './useFilter';

export const useFilterCurrentlyEdited = () => {
  const { selectedFilters, filterDefinitionUsedInDropdown } = useFilter();

  return useMemo(() => {
    return selectedFilters?.find(
      (filter) => filter.key === filterDefinitionUsedInDropdown?.key,
    );
  }, [filterDefinitionUsedInDropdown?.key, selectedFilters]);
};
