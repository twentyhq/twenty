import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { WorkflowStepFilterFieldSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterFieldSelect';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOperandSelect';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterValueInput } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterValueInput';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowStepFilterColumnProps = {
  stepFilterGroup: StepFilterGroup;
  stepFilter: StepFilter;
  stepFilterIndex: number;
  firstFilterLabel?: string;
  elseIfIndex?: number;
  preventDeletion?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

export const WorkflowStepFilterColumn = ({
  stepFilterGroup,
  stepFilter,
  stepFilterIndex,
  firstFilterLabel,
  elseIfIndex,
  preventDeletion = false,
}: WorkflowStepFilterColumnProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const shouldShowDropdown = !readonly && !preventDeletion;

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <WorkflowStepFilterLogicalOperatorCell
          index={stepFilterIndex}
          stepFilterGroup={stepFilterGroup}
          firstFilterLabel={firstFilterLabel}
          elseIfIndex={elseIfIndex}
        />
        {shouldShowDropdown && (
          <WorkflowStepFilterOptionsDropdown stepFilterId={stepFilter.id} />
        )}
      </StyledContainer>
      <WorkflowStepFilterFieldSelect stepFilter={stepFilter} />
      <WorkflowStepFilterOperandSelect stepFilter={stepFilter} />
      <WorkflowStepFilterValueInput stepFilter={stepFilter} />
    </AdvancedFilterSidePanelColumn>
  );
};
