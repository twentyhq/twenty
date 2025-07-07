import { WorkflowStepFilterGroupChildren } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterGroupChildren';
import { WorkflowStepFilterGroupOptionsDropdown } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterGroupOptionsDropdown';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowAdvancedFilterDropdownColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterDropdownColumn';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { StepFilterGroup } from 'twenty-shared/src/types';

type WorkflowStepFilterGroupColumnProps = {
  parentStepFilterGroup: StepFilterGroup;
  stepFilterGroup: StepFilterGroup;
  stepFilterGroupIndex: number;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowStepFilterGroupColumn = ({
  parentStepFilterGroup,
  stepFilterGroup,
  stepFilterGroupIndex,
}: WorkflowStepFilterGroupColumnProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  return (
    <WorkflowAdvancedFilterDropdownColumn>
      <StyledContainer>
        <WorkflowStepFilterLogicalOperatorCell
          index={stepFilterGroupIndex}
          stepFilterGroup={parentStepFilterGroup}
        />
        {!readonly && (
          <WorkflowStepFilterGroupOptionsDropdown
            stepFilterGroupId={stepFilterGroup.id}
          />
        )}
      </StyledContainer>
      <WorkflowStepFilterGroupChildren stepFilterGroupId={stepFilterGroup.id} />
    </WorkflowAdvancedFilterDropdownColumn>
  );
};
