import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { WorkflowStepFilterGroupChildren } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupChildren';
import { WorkflowStepFilterGroupOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupOptionsDropdown';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type StepFilterGroup } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowStepFilterGroupColumnProps = {
  parentStepFilterGroup: StepFilterGroup;
  stepFilterGroup: StepFilterGroup;
  stepFilterGroupIndex: number;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkflowStepFilterGroupColumn = ({
  parentStepFilterGroup,
  stepFilterGroup,
  stepFilterGroupIndex,
}: WorkflowStepFilterGroupColumnProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  return (
    <AdvancedFilterSidePanelColumn>
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
    </AdvancedFilterSidePanelColumn>
  );
};
