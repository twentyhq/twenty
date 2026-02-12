import { AdvancedFilterCommandMenuColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuColumn';
import { WorkflowStepFilterFieldSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterFieldSelect';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOperandSelect';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterValueInput } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterValueInput';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

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
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
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
    <AdvancedFilterCommandMenuColumn>
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
    </AdvancedFilterCommandMenuColumn>
  );
};
