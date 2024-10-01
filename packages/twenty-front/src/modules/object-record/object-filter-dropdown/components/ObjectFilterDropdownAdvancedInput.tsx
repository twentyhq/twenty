/* eslint-disable react/jsx-props-no-spreading */
import { AdvancedFilterQueryBuilder } from '@/object-record/object-filter-dropdown/components/AdvancedFilterQueryBuilder';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { AdvancedFilterQuery } from '@/object-record/object-filter-dropdown/types/AdvancedFilterQuery';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { computeAdvancedViewFilterValue } from '@/views/utils/view-filter-value/computeAdvancedViewFilterValue';
import { resolveFilterValue } from '@/views/utils/view-filter-value/resolveFilterValue';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

export const ObjectFilterDropdownAdvancedInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedFilterState,
    setIsObjectFilterDropdownUnfolded,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState) as
    | (Filter & { definition: { type: 'ADVANCED' } })
    | null
    | undefined;

  const onChange = (advancedFilterQuery: AdvancedFilterQuery) => {
    if (!filterDefinitionUsedInDropdown) return;

    selectFilter?.({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value: computeAdvancedViewFilterValue(advancedFilterQuery),
      operand: ViewFilterOperand.Is,
      displayValue: '',
      definition: filterDefinitionUsedInDropdown,
    });

    setIsObjectFilterDropdownUnfolded(false);
  };

  const advancedFilterQuery =
    selectedFilter && resolveFilterValue(selectedFilter);

  return (
    <div>
      <AdvancedFilterQueryBuilder
        advancedFilterQuery={advancedFilterQuery}
        onChange={onChange}
      />
    </div>
  );
};
