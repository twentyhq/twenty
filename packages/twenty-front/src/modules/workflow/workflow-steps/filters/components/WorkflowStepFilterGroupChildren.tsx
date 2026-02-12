import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
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
};

export const WorkflowStepFilterGroupChildren = ({
  stepFilterGroupId,
}: WorkflowStepFilterGroupChildrenProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { currentStepFilterGroup, childStepFilters } =
    useChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId,
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
