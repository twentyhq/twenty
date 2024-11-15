import { AdvancedFilterViewFilterFieldSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterFieldSelect';
import { AdvancedFilterViewFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterOperandSelect';
import { AdvancedFilterViewFilterValueInput } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterValueInput';
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

export const AdvancedFilterViewFilter = ({
  viewFilterId,
}: AdvancedFilterViewFilterProps) => {
  const filter = useCurrentViewFilter({ viewFilterId });

  if (!filter) {
    return null;
  }

  return (
    <ObjectFilterDropdownScope filterScopeId={filter.id}>
      <StyledRow>
        <AdvancedFilterViewFilterFieldSelect viewFilterId={filter.id} />
        <AdvancedFilterViewFilterOperandSelect viewFilterId={filter.id} />
        <StyledValueDropdownContainer>
          {configurableViewFilterOperands.has(filter.operand) && (
            <AdvancedFilterViewFilterValueInput viewFilterId={filter.id} />
          )}
        </StyledValueDropdownContainer>
      </StyledRow>
    </ObjectFilterDropdownScope>
  );
};
