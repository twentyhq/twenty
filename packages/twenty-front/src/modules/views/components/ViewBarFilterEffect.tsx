import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { availableFilterDefinitionsInstanceState } from '@/views/states/availableFilterDefinitionsInstanceState';
import { isDefined } from '~/utils/isDefined';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const { upsertCombinedViewFilter } = useCombinedViewFilters();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const availableFilterDefinitions = useRecoilInstanceValue(
    availableFilterDefinitionsInstanceState,
  );

  const {
    setOnFilterSelect,
    filterDefinitionUsedInDropdownState,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
  } = useFilterDropdown({ filterDropdownId });

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  // TODO: verify this instance id works
  const setAvailableFilterDefinitions = useSetRecoilInstanceState(
    availableFilterDefinitionsInstanceState,
    filterDropdownId,
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
