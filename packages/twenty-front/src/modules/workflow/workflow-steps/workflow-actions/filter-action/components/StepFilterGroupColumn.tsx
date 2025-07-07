import { StepFilterGroupChildren } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterGroupChildren';
import { StepFilterGroupOptionsDropdown } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterGroupOptionsDropdown';
import { StepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterLogicalOperatorCell';
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

export const StepFilterGroupColumn = ({
  parentStepFilterGroup,
  stepFilterGroup,
  stepFilterGroupIndex,
  stepFilterGroups,
  stepFilters,
}: {
  parentStepFilterGroup: StepFilterGroup;
  stepFilterGroup: StepFilterGroup;
  stepFilterGroupIndex: number;
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
}) => {
  const { readonly } = useContext(StepFilterContext);

  return (
    <WorkflowAdvancedFilterDropdownColumn>
      <StyledContainer>
        <StepFilterLogicalOperatorCell
          index={stepFilterGroupIndex}
          stepFilterGroup={parentStepFilterGroup}
        />
        {!readonly && (
          <StepFilterGroupOptionsDropdown
            stepFilterGroupId={stepFilterGroup.id}
          />
        )}
      </StyledContainer>
      <StepFilterGroupChildren
        stepFilterGroupId={stepFilterGroup.id}
        stepFilterGroups={stepFilterGroups}
        stepFilters={stepFilters}
      />
    </WorkflowAdvancedFilterDropdownColumn>
  );
};
