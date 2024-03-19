import { useEffect } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { isDefined } from '~/utils/isDefined';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
  onFilterSelect?: ((filter: Filter) => void) | undefined;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
  onFilterSelect,
}: ViewBarFilterEffectProps) => {
  const { availableFilterDefinitionsState, currentViewFiltersState } =
    useViewScopedStates();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const {
    setAvailableFilterDefinitions,
    setOnFilterSelect,
    filterDefinitionUsedInDropdown,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    isObjectFilterDropdownUnfolded,
  } = useFilterDropdown({ filterDropdownId });

  useEffect(() => {
    if (isDefined(availableFilterDefinitions)) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }

    if (isDefined(onFilterSelect)) {
      setOnFilterSelect(() => onFilterSelect);
    }
  }, [
    availableFilterDefinitions,
    onFilterSelect,
    setAvailableFilterDefinitions,
    setOnFilterSelect,
  ]);

  const currentViewFilters = useRecoilValue(currentViewFiltersState);

  useEffect(() => {
    if (filterDefinitionUsedInDropdown?.type === 'RELATION') {
      const viewFilterUsedInDropdown = currentViewFilters.find(
        (filter) =>
          filter.fieldMetadataId ===
          filterDefinitionUsedInDropdown.fieldMetadataId,
      );

      const viewFilterSelectedRecordIds = isNonEmptyString(
        viewFilterUsedInDropdown?.value,
      )
        ? JSON.parse(viewFilterUsedInDropdown.value)
        : [];

      setObjectFilterDropdownSelectedRecordIds(viewFilterSelectedRecordIds);
    } else if (filterDefinitionUsedInDropdown?.type === 'SELECT') {
      const viewFilterUsedInDropdown = currentViewFilters.find(
        (filter) =>
          filter.fieldMetadataId ===
          filterDefinitionUsedInDropdown.fieldMetadataId,
      );

      const viewFilterSelectedOptionValues = isNonEmptyString(
        viewFilterUsedInDropdown?.value,
      )
        ? JSON.parse(viewFilterUsedInDropdown.value)
        : [];

      setObjectFilterDropdownSelectedOptionValues(
        viewFilterSelectedOptionValues,
      );
    }
  }, [
    filterDefinitionUsedInDropdown,
    currentViewFilters,
    setObjectFilterDropdownSelectedRecordIds,
    isObjectFilterDropdownUnfolded,
    setObjectFilterDropdownSelectedOptionValues,
  ]);

  return <></>;
};
