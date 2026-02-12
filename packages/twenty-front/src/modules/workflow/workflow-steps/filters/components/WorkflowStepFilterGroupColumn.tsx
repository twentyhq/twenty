import { AdvancedFilterCommandMenuColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuColumn';
import { WorkflowStepFilterGroupChildren } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupChildren';
import { WorkflowStepFilterGroupOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupOptionsDropdown';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { type StepFilterGroup } from 'twenty-shared/types';

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
    <AdvancedFilterCommandMenuColumn>
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
    </AdvancedFilterCommandMenuColumn>
  );
};
