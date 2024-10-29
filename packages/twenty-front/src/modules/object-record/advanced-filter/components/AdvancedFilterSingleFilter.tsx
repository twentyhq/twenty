import { AdvancedFilterFieldSelect } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelect';
import { AdvancedFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterOperandSelect';
import { AdvancedFilterValueInput } from '@/object-record/advanced-filter/components/AdvancedFilterValueInput';
import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
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
  viewFilterId: string;
};

export const AdvancedFilterSingleFilter = ({
  viewFilterId,
}: AdvancedFilterViewFilterProps) => {
  const filter = useCurrentViewFilter({ viewFilterId });

  if (!filter) {
    return null;
  }

  return (
    <ObjectFilterDropdownScope filterScopeId={filter.id}>
      <StyledRow>
        <AdvancedFilterFieldSelect viewFilterId={filter.id} />
        <AdvancedFilterOperandSelect viewFilterId={filter.id} />
        <StyledValueDropdownContainer>
          {configurableViewFilterOperands.has(filter.operand) && (
            <AdvancedFilterValueInput viewFilterId={filter.id} />
          )}
        </StyledValueDropdownContainer>
      </StyledRow>
    </ObjectFilterDropdownScope>
  );
};
