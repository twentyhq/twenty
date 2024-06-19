import { useEffect } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const { availableFilterDefinitionsState } = useViewStates();

  const { upsertCombinedViewFilter } = useCombinedViewFilters();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const {
    setAvailableFilterDefinitions,
    setOnFilterSelect,
    filterDefinitionUsedInDropdownState,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
  } = useFilterDropdown({ filterDropdownId });

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  useEffect(() => {
    if (isDefined(availableFilterDefinitions)) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }
    setOnFilterSelect(() => (filter: Filter | null) => {
      if (isDefined(filter)) {
        upsertCombinedViewFilter(filter);
      }
    });
  }, [
    availableFilterDefinitions,
    setAvailableFilterDefinitions,
    setOnFilterSelect,
    upsertCombinedViewFilter,
  ]);

  useEffect(() => {
    if (filterDefinitionUsedInDropdown?.type === 'RELATION') {
      const viewFilterUsedInDropdown =
        currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
          (filter) =>
            filter.fieldMetadataId ===
            filterDefinitionUsedInDropdown?.fieldMetadataId,
        );

      const viewFilterSelectedRecords = isNonEmptyString(
        viewFilterUsedInDropdown?.value,
      )
        ? JSON.parse(viewFilterUsedInDropdown.value)
        : [];
      setObjectFilterDropdownSelectedRecordIds(viewFilterSelectedRecords);
    } else if (filterDefinitionUsedInDropdown?.type === 'SELECT') {
      const viewFilterUsedInDropdown =
        currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
          (filter) =>
            filter.fieldMetadataId ===
            filterDefinitionUsedInDropdown?.fieldMetadataId,
        );

      const viewFilterSelectedRecords = isNonEmptyString(
        viewFilterUsedInDropdown?.value,
      )
        ? JSON.parse(viewFilterUsedInDropdown.value)
        : [];
      setObjectFilterDropdownSelectedOptionValues(viewFilterSelectedRecords);
    }
  }, [
    filterDefinitionUsedInDropdown,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    currentViewWithCombinedFiltersAndSorts,
  ]);

  return <></>;
};
