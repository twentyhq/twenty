import { InputLabel } from '@/ui/input/components/InputLabel';
import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterGroupColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterGroupColumn';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/isStepFilterGroupChildAStepFilterGroup';
import {
  type FilterSettings,
  type IfElseSettings,
} from '@/workflow/workflow-steps/workflow-actions/if-else-action/components/WorkflowEditActionIfElseBody';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  type StepFilterGroup,
  type StepIfElseBranch,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  branchLabel: string;
  branchFilterGroup: StepFilterGroup | undefined;
  readonly: boolean;
  onSettingsUpdate: (newSettings: IfElseSettings) => void;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => void;
};

export const WorkflowIfElseBranchEditor = ({
  action,
  branch,
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
    return (
      <StyledBranchContainer>
        <StyledBranchHeader>
          <StyledBranchLabel>{branchLabel}</StyledBranchLabel>
        </StyledBranchHeader>
        <StyledElsePlaceholder>
          {t`Default path when no conditions match`}
        </StyledElsePlaceholder>
      </StyledBranchContainer>
    );
  }

  return (
    <WorkflowStepFilterContext.Provider
      value={{
        stepId: action.id,
        readonly,
        onFilterSettingsUpdate,
        firstFilterLabel: branchLabel,
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
