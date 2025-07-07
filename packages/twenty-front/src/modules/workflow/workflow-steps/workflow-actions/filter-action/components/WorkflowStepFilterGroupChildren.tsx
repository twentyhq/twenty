import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { getChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/getChildStepFiltersAndChildStepFilterGroups';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{ isGrayBackground?: boolean }>`
  align-items: start;
  background-color: ${({ theme, isGrayBackground }) =>
    isGrayBackground ? theme.background.transparent.lighter : 'transparent'};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowStepFilterGroupChildrenProps = {
  stepFilterGroupId: string;
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
};

export const WorkflowStepFilterGroupChildren = ({
  stepFilterGroupId,
  stepFilterGroups,
  stepFilters,
}: WorkflowStepFilterGroupChildrenProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { currentStepFilterGroup, childStepFilters } =
    getChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId,
      stepFilterGroups: stepFilterGroups ?? [],
      stepFilters: stepFilters ?? [],
    });

  if (!currentStepFilterGroup) {
    return null;
  }

  const hasParentStepFilterGroup = isDefined(
    currentStepFilterGroup.parentStepFilterGroupId,
  );

  return (
    <StyledContainer isGrayBackground={hasParentStepFilterGroup}>
      {(childStepFilters ?? []).map((childStepFilter, childStepFilterIndex) => (
        <WorkflowStepFilterColumn
          key={childStepFilter.id}
          stepFilter={childStepFilter}
          stepFilterIndex={childStepFilterIndex}
          stepFilterGroup={currentStepFilterGroup}
        />
      ))}
      {!readonly && (
        <WorkflowStepFilterAddFilterRuleSelect
          stepFilterGroup={currentStepFilterGroup}
        />
      )}
    </StyledContainer>
  );
};
