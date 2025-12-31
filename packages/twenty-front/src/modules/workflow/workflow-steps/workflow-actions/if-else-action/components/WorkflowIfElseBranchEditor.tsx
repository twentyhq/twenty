import { InputLabel } from '@/ui/input/components/InputLabel';
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

const StyledBranchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledBranchLabel = styled(InputLabel)`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledElsePlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-style: italic;
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
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => void;
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

  return (
    <WorkflowStepFilterContext.Provider
      value={{
        stepId: action.id,
        readonly,
        onFilterSettingsUpdate,
      }}
    >
      <StyledBranchContainer>
        <StyledFiltersContainer>
          {isDefined(branchFilterGroup) &&
            childStepFiltersAndChildStepFilterGroups.map(
              (stepFilterGroupChild, stepFilterGroupChildIndex) =>
                isStepFilterGroupChildAStepFilterGroup(stepFilterGroupChild) ? (
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
                    isIfBranch={isIfBranch}
                    firstFilterLabel={i18n._(branchLabel)}
                  />
                ),
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
