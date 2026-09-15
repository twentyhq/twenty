import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CoreWorkflowFilterFieldSelect } from '@/object-core/workflows/components/CoreWorkflowFilterFieldSelect';
import { CoreWorkflowFilterValueInput } from '@/object-core/workflows/components/CoreWorkflowFilterValueInput';
import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOperandSelect';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

type CoreWorkflowFilterColumnProps = {
  stepFilterGroup: StepFilterGroup;
  stepFilter: StepFilter;
  stepFilterIndex: number;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

export const CoreWorkflowFilterColumn = ({
  stepFilterGroup,
  stepFilter,
  stepFilterIndex,
}: CoreWorkflowFilterColumnProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <WorkflowStepFilterLogicalOperatorCell
          index={stepFilterIndex}
          stepFilterGroup={stepFilterGroup}
        />
        {!readonly && (
          <WorkflowStepFilterOptionsDropdown stepFilterId={stepFilter.id} />
        )}
      </StyledContainer>
      <CoreWorkflowFilterFieldSelect stepFilter={stepFilter} />
      <WorkflowStepFilterOperandSelect stepFilter={stepFilter} />
      <CoreWorkflowFilterValueInput stepFilter={stepFilter} />
    </AdvancedFilterSidePanelColumn>
  );
};
