import { WorkflowStepFilterFieldSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterFieldSelect';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterOperandSelect';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterValueInput } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterValueInput';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowAdvancedFilterDropdownColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterDropdownColumn';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';

type WorkflowStepFilterColumnProps = {
  stepFilterGroup: StepFilterGroup;
  stepFilter: StepFilter;
  stepFilterIndex: number;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowStepFilterColumn = ({
  stepFilterGroup,
  stepFilter,
  stepFilterIndex,
}: WorkflowStepFilterColumnProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  return (
    <WorkflowAdvancedFilterDropdownColumn>
      <StyledContainer>
        <WorkflowStepFilterLogicalOperatorCell
          index={stepFilterIndex}
          stepFilterGroup={stepFilterGroup}
        />
        {!readonly && (
          <WorkflowStepFilterOptionsDropdown stepFilterId={stepFilter.id} />
        )}
      </StyledContainer>
      <WorkflowStepFilterFieldSelect stepFilter={stepFilter} />
      <WorkflowStepFilterOperandSelect stepFilter={stepFilter} />
      <WorkflowStepFilterValueInput stepFilter={stepFilter} />
    </WorkflowAdvancedFilterDropdownColumn>
  );
};
