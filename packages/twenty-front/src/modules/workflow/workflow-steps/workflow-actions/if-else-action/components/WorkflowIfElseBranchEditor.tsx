import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterGroupColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupColumn';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/filters/utils/isStepFilterGroupChildAStepFilterGroup';
import styled from '@emotion/styled';
import { i18n, type MessageDescriptor } from '@lingui/core';
import { type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

const StyledBranchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledFiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

type WorkflowIfElseBranchEditorProps = {
  action: WorkflowIfElseAction;
  branch: StepIfElseBranch;
  branchIndex: number;
  branchLabel: MessageDescriptor;
  branchFilterGroup: StepFilterGroup | undefined;
  readonly: boolean;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => Promise<void>;
};

export const WorkflowIfElseBranchEditor = ({
  action,
  branch,
  branchIndex,
  branchLabel,
  branchFilterGroup,
  readonly,
  onFilterSettingsUpdate,
}: WorkflowIfElseBranchEditorProps) => {
  const isElseBranch = !isDefined(branch.filterGroupId);

  const { childStepFiltersAndChildStepFilterGroups } =
    useChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId: branchFilterGroup?.id ?? '',
    });

  if (isElseBranch) {
    return null;
  }

  const isIfBranch = branchIndex === 0;

  const isLastFilterInIfBranch = (stepFilter: {
    stepFilterGroupId: string;
  }): boolean => {
    const childStepFilters = childStepFiltersAndChildStepFilterGroups.filter(
      (child) => !isStepFilterGroupChildAStepFilterGroup(child),
    );
    const childStepFilterGroups =
      childStepFiltersAndChildStepFilterGroups.filter(
        isStepFilterGroupChildAStepFilterGroup,
      );

    return (
      isIfBranch &&
      isDefined(branchFilterGroup) &&
      stepFilter.stepFilterGroupId === branchFilterGroup.id &&
      childStepFilters.length === 1 &&
      childStepFilterGroups.length === 0
    );
  };

  return (
    <StyledBranchContainer>
      <StyledFiltersContainer>
        {isDefined(branchFilterGroup) &&
          childStepFiltersAndChildStepFilterGroups.map(
            (stepFilterGroupChild, stepFilterGroupChildIndex) => (
              <WorkflowStepFilterContext.Provider
                key={stepFilterGroupChild.id}
                value={{
                  stepId: action.id,
                  readonly: isStepFilterGroupChildAStepFilterGroup(
                    stepFilterGroupChild,
                  )
                    ? readonly
                    : readonly || isLastFilterInIfBranch(stepFilterGroupChild),
                  onFilterSettingsUpdate,
                }}
              >
                {isStepFilterGroupChildAStepFilterGroup(
                  stepFilterGroupChild,
                ) ? (
                  <WorkflowStepFilterGroupColumn
                    parentStepFilterGroup={branchFilterGroup}
                    stepFilterGroup={stepFilterGroupChild}
                    stepFilterGroupIndex={stepFilterGroupChildIndex}
                  />
                ) : (
                  <WorkflowStepFilterColumn
                    stepFilterGroup={branchFilterGroup}
                    stepFilter={stepFilterGroupChild}
                    stepFilterIndex={stepFilterGroupChildIndex}
                    firstFilterLabel={i18n._(branchLabel)}
                  />
                )}
              </WorkflowStepFilterContext.Provider>
            ),
          )}
      </StyledFiltersContainer>

      {!readonly && isDefined(branchFilterGroup) && (
        <WorkflowStepFilterAddFilterRuleSelect
          stepFilterGroup={branchFilterGroup}
        />
      )}
    </StyledBranchContainer>
  );
};
