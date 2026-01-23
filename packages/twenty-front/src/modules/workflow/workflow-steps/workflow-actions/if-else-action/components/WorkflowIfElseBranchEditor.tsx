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
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
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
  elseIfIndex?: number;
  branchFilterGroup: StepFilterGroup | undefined;
  readonly: boolean;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => Promise<void>;
};

export const WorkflowIfElseBranchEditor = ({
  action,
  branch,
  branchIndex,
  branchLabel,
  elseIfIndex,
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

  const isLastFilterInIfBranch = (stepFilter: StepFilter): boolean => {
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
    <WorkflowStepFilterContext.Provider
      value={{
        stepId: action.id,
        readonly: readonly,
        onFilterSettingsUpdate,
      }}
    >
      <StyledBranchContainer>
        <StyledFiltersContainer>
          {isDefined(branchFilterGroup) &&
            childStepFiltersAndChildStepFilterGroups.map(
              (stepFilterGroupChild, stepFilterGroupChildIndex) => {
                const isFilterGroup =
                  isStepFilterGroupChildAStepFilterGroup(stepFilterGroupChild);
                const preventDeletion =
                  !isFilterGroup &&
                  isLastFilterInIfBranch(stepFilterGroupChild);

                return isFilterGroup ? (
                  <WorkflowStepFilterGroupColumn
                    key={stepFilterGroupChild.id}
                    parentStepFilterGroup={branchFilterGroup}
                    stepFilterGroup={stepFilterGroupChild}
                    stepFilterGroupIndex={stepFilterGroupChildIndex}
                  />
                ) : (
                  <WorkflowStepFilterColumn
                    key={stepFilterGroupChild.id}
                    stepFilterGroup={branchFilterGroup}
                    stepFilter={stepFilterGroupChild}
                    stepFilterIndex={stepFilterGroupChildIndex}
                    firstFilterLabel={capitalize(
                      i18n._(branchLabel).toLowerCase(),
                    )}
                    elseIfIndex={elseIfIndex}
                    preventDeletion={preventDeletion}
                  />
                );
              },
            )}
        </StyledFiltersContainer>

        {!readonly && isDefined(branchFilterGroup) && (
          <WorkflowStepFilterAddFilterRuleSelect
            stepFilterGroup={branchFilterGroup}
          />
        )}
      </StyledBranchContainer>
    </WorkflowStepFilterContext.Provider>
  );
};
