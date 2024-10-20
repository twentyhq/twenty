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

type AdvancedFilterViewFilterProps = {
  viewFilter: ViewFilter;
};

export const AdvancedFilterViewFilter = ({
  viewFilter,
}: AdvancedFilterViewFilterProps) => {
  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const [filter] = mapViewFiltersToFilters(
    [viewFilter],
    availableFilterDefinitions,
  );

  return (
    <ObjectFilterDropdownScope filterScopeId={viewFilter.id}>
      <StyledRow>
        <AdvancedFilterViewFilterFieldSelect
          viewFilter={viewFilter}
          selectedFieldLabel={filter?.definition?.label ?? 'Select field'}
        />
        <AdvancedFilterViewFilterOperandSelect
          viewFilter={viewFilter}
          filterDefinition={filter?.definition}
          isDisabled={!viewFilter.fieldMetadataId}
        />
        <StyledValueDropdownContainer>
          {configurableViewFilterOperands.has(viewFilter.operand) && (
            <AdvancedFilterViewFilterValueInput
              filter={filter}
              filterDefinition={filter?.definition}
              isDisabled={!viewFilter.fieldMetadataId || !viewFilter.operand}
            />
          )}
        </StyledValueDropdownContainer>
      </StyledRow>
    </ObjectFilterDropdownScope>
  );
};
