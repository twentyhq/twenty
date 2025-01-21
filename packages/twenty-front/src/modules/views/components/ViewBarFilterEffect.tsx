import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { objectFilterDropdownSelectedOptionValuesComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedOptionValuesComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { onFilterSelectComponentState } from '@/object-record/object-filter-dropdown/states/onFilterSelectComponentState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { relationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/relationFilterValueSchema';
import { isDefined } from '~/utils/isDefined';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const setOnFilterSelect = useSetRecoilComponentStateV2(
    onFilterSelectComponentState,
    filterDropdownId,
  );

  const filterDefinitionUsedInDropdown = useRecoilComponentValueV2(
    filterDefinitionUsedInDropdownComponentState,
    filterDropdownId,
  );

  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilComponentStateV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
    filterDropdownId,
  );

  const setObjectFilterDropdownSelectedOptionValues =
    useSetRecoilComponentStateV2(
      objectFilterDropdownSelectedOptionValuesComponentState,
      filterDropdownId,
    );

  // TODO: verify this instance id works
  const setAvailableFilterDefinitions = useSetRecoilComponentStateV2(
    availableFilterDefinitionsComponentState,
    filterDropdownId,
  );

  useEffect(() => {
    if (isDefined(availableFilterDefinitions)) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }
    setOnFilterSelect(() => (filter: RecordFilter | null) => {
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

      const parsedFilterValue = relationFilterValueSchema.parse(
        viewFilterUsedInDropdown?.value,
      );

      const isVariableItem = (item: string) =>
        item.startsWith('{{') && item.endsWith('}}');

      const selectedRecordIds = parsedFilterValue.filter(
        (item) => !isVariableItem(item),
      );

      setObjectFilterDropdownSelectedRecordIds(selectedRecordIds);
    } else if (
      isDefined(filterDefinitionUsedInDropdown) &&
      ['SELECT', 'MULTI_SELECT'].includes(filterDefinitionUsedInDropdown.type)
    ) {
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
