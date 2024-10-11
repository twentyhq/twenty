import { AdvancedFilterViewFilterFieldSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterFieldSelect';
import { AdvancedFilterViewFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterOperandSelect';
import { AdvancedFilterViewFilterValueInput } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterValueInput';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import styled from '@emotion/styled';

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

interface AdvancedFilterViewFilterProps {
  viewFilter: ViewFilter;
}

export const AdvancedFilterViewFilter = (
  props: AdvancedFilterViewFilterProps,
) => {
  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const [filter] = mapViewFiltersToFilters(
    [props.viewFilter],
    availableFilterDefinitions,
  );

  return (
    <StyledRow>
      <AdvancedFilterViewFilterFieldSelect
        viewFilter={props.viewFilter}
        selectedFieldLabel={filter?.definition?.label ?? 'Select field'}
      />
      <AdvancedFilterViewFilterOperandSelect
        viewFilter={props.viewFilter}
        filterDefinition={filter?.definition}
        isDisabled={!props.viewFilter.fieldMetadataId}
      />
      {configurableViewFilterOperands.has(props.viewFilter.operand) && (
        <AdvancedFilterViewFilterValueInput
          viewFilter={props.viewFilter}
          filterDefinition={filter?.definition}
          isDisabled={
            !props.viewFilter.fieldMetadataId || !props.viewFilter.operand
          }
        />
      )}
    </StyledRow>
  );
};
