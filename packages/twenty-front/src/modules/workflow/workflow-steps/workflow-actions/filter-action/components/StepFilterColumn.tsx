import { StepFilterFieldSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterFieldSelect';
import { StepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterLogicalOperatorCell';
import { StepFilterOperandSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterOperandSelect';
import { StepFilterOptionsDropdown } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterOptionsDropdown';
import { StepFilterValueInput } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterValueInput';
import { StepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterContext';
import { WorkflowAdvancedFilterDropdownColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterDropdownColumn';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StepFilterColumn = ({
  stepFilterGroup,
  stepFilter,
  stepFilterIndex,
}: {
  stepFilterGroup: StepFilterGroup;
  stepFilter: StepFilter;
  stepFilterIndex: number;
}) => {
  const { readonly } = useContext(StepFilterContext);

  return (
    <WorkflowAdvancedFilterDropdownColumn>
      <StyledContainer>
        <StepFilterLogicalOperatorCell
          index={stepFilterIndex}
          stepFilterGroup={stepFilterGroup}
        />
        {!readonly && (
          <StepFilterOptionsDropdown stepFilterId={stepFilter.id} />
        )}
      </StyledContainer>
      <StepFilterFieldSelect stepFilter={stepFilter} />
      <StepFilterOperandSelect stepFilter={stepFilter} />
      <StepFilterValueInput stepFilter={stepFilter} />
    </WorkflowAdvancedFilterDropdownColumn>
  );
};
