import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ isGrayBackground?: boolean }>`
  align-items: start;
  background-color: ${({ isGrayBackground }) =>
    isGrayBackground
      ? themeCssVariables.background.transparent.lighter
      : 'transparent'};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[2]};
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
