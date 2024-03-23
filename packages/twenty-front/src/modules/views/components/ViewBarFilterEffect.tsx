import { useEffect } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { isDefined } from '~/utils/isDefined';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const { availableFilterDefinitionsState, unsavedToUpsertViewFiltersState } =
    useViewStates();

  const { upsertCombinedViewFilter } = useCombinedViewFilters();

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

  const unsavedToUpsertViewFilters = useRecoilValue(
    unsavedToUpsertViewFiltersState,
  );

  useEffect(() => {
    if (filterDefinitionUsedInDropdown?.type === 'RELATION') {
      const viewFilterUsedInDropdown = unsavedToUpsertViewFilters.find(
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
      const viewFilterUsedInDropdown = unsavedToUpsertViewFilters.find(
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
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    unsavedToUpsertViewFilters,
  ]);

  return <></>;
};
