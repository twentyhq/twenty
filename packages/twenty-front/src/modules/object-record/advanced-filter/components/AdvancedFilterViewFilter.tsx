import { AdvancedFilterViewFilterFieldSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterFieldSelect';
import { AdvancedFilterViewFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterOperandSelect';
import { AdvancedFilterViewFilterValueInput } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterValueInput';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import styled from '@emotion/styled';

const StyledValueDropdownContainer = styled.div`
  flex: 3;
`;

const StyledRow = styled.div`
  flex: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
  overflow: hidden;
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
    <ObjectFilterDropdownScope filterScopeId={props.viewFilter.id}>
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
        <StyledValueDropdownContainer>
          {configurableViewFilterOperands.has(props.viewFilter.operand) && (
            <AdvancedFilterViewFilterValueInput
              filter={filter}
              filterDefinition={filter?.definition}
              isDisabled={
                !props.viewFilter.fieldMetadataId || !props.viewFilter.operand
              }
            />
          )}
        </StyledValueDropdownContainer>
      </StyledRow>
    </ObjectFilterDropdownScope>
  );
};
