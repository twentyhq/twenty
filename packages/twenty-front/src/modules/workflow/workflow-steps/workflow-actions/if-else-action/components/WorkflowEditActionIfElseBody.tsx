import { InputLabel } from '@/ui/input/components/InputLabel';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { WorkflowIfElseBranchEditor } from '@/workflow/workflow-steps/workflow-actions/if-else-action/components/WorkflowIfElseBranchEditor';
import { getBranchLabel } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchLabel';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';
import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledBodyContainer = styled(WorkflowStepBody)`
  gap: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowEditActionIfElseBodyProps = {
  action: WorkflowIfElseAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowIfElseAction) => void;
      };
};

export type IfElseSettings = {
  stepFilterGroups: StepFilterGroup[];
  stepFilters: StepFilter[];
  branches: WorkflowIfElseAction['settings']['input']['branches'];
};

export type FilterSettings = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
};

const IF_ELSE_IF_BRANCH_POSITION_OFFSET = {
  x: -200,
  y: 120,
};

const IF_ELSE_ELSE_BRANCH_POSITION_OFFSET = {
  x: 200,
  y: 120,
};

export const WorkflowEditActionIfElseBody = ({
  action,
  actionOptions,
}: WorkflowEditActionIfElseBodyProps) => {
  const branches = action.settings.input.branches;
  const stepFilterGroups = action.settings.input.stepFilterGroups ?? [];
  const stepFilters = action.settings.input.stepFilters ?? [];

  const { createStep } = useCreateStep();

  const currentStepFilters = useRecoilComponentValue(
    currentStepFiltersComponentState,
  );
  const currentStepFilterGroups = useRecoilComponentValue(
    currentStepFilterGroupsComponentState,
  );
  const setCurrentStepFilters = useSetRecoilComponentState(
    currentStepFiltersComponentState,
  );
  const setCurrentStepFilterGroups = useSetRecoilComponentState(
    currentStepFilterGroupsComponentState,
  );

  const onFilterSettingsUpdate = (newFilterSettings: FilterSettings) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          stepFilterGroups: newFilterSettings.stepFilterGroups ?? [],
          stepFilters: newFilterSettings.stepFilters ?? [],
        },
      },
    });
  };

  const onSettingsUpdate = (newSettings: IfElseSettings) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: newSettings.stepFilterGroups,
          stepFilters: newSettings.stepFilters,
          branches: newSettings.branches,
        },
      },
    });
  };

  const handleAddRoute = async (event?: React.MouseEvent<HTMLElement>) => {
    if (isDefined(event)) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (actionOptions.readonly === true) {
      return;
    }

    const newFilterGroupId = v4();
    const newFilterId = v4();
    const newBranchId = v4();

    const newFilterGroup: StepFilterGroup = {
      id: newFilterGroupId,
      logicalOperator: StepLogicalOperator.AND,
      positionInStepFilterGroup: 0,
    };

    const newFilter: StepFilter = {
      id: newFilterId,
      type: 'unknown',
      stepOutputKey: '',
      operand: ViewFilterOperand.IS,
      value: '',
      stepFilterGroupId: newFilterGroupId,
      positionInStepFilterGroup: 0,
    };

    const elseIfBranchIndex = branches.length - 1;
    const totalElseIfBranches = elseIfBranchIndex;

    const positionX =
      totalElseIfBranches > 0
        ? IF_ELSE_IF_BRANCH_POSITION_OFFSET.x +
          ((IF_ELSE_ELSE_BRANCH_POSITION_OFFSET.x -
            IF_ELSE_IF_BRANCH_POSITION_OFFSET.x) *
            elseIfBranchIndex) /
            (totalElseIfBranches + 1)
        : IF_ELSE_IF_BRANCH_POSITION_OFFSET.x;

    const ifElseStepPosition = action.position ?? { x: 0, y: 0 };
    const emptyNodePosition = {
      x: ifElseStepPosition.x + positionX,
      y: ifElseStepPosition.y + IF_ELSE_IF_BRANCH_POSITION_OFFSET.y,
    };

    const emptyNode = await createStep({
      newStepType: 'EMPTY',
      parentStepId: undefined,
      nextStepId: undefined,
      position: emptyNodePosition,
      shouldSelectNode: false,
    });

    if (!isDefined(emptyNode)) {
      return;
    }

    const newBranch = {
      id: newBranchId,
      filterGroupId: newFilterGroupId,
      nextStepIds: [emptyNode.id],
    };

    const updatedBranches = [...branches];
    updatedBranches.splice(branches.length - 1, 0, newBranch);

    const updatedStepFilterGroups = [...stepFilterGroups, newFilterGroup];
    const updatedStepFilters = [...stepFilters, newFilter];

    setCurrentStepFilterGroups([...currentStepFilterGroups, newFilterGroup]);
    setCurrentStepFilters([...currentStepFilters, newFilter]);

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          stepFilterGroups: updatedStepFilterGroups,
          stepFilters: updatedStepFilters,
          branches: updatedBranches,
        },
      },
    });
  };

  const isElseBranch = (branchIndex: number) =>
    branchIndex === branches.length - 1 &&
    !isDefined(branches[branchIndex].filterGroupId);

  return (
    <StyledBodyContainer>
      <InputLabel>{t`Conditions`}</InputLabel>
      <StyledContainer>
        {branches.map((branch, branchIndex) => {
          const branchFilterGroup = isDefined(branch.filterGroupId)
            ? stepFilterGroups.find((g) => g.id === branch.filterGroupId)
            : undefined;

          return (
            <Fragment key={branch.id}>
              {branchIndex > 0 && !isElseBranch(branchIndex) && (
                <HorizontalSeparator noMargin />
              )}
              {isElseBranch(branchIndex) && !actionOptions.readonly && (
                <>
                  <HorizontalSeparator noMargin />
                  <Button
                    Icon={IconPlus}
                    title={t`Add route`}
                    variant="secondary"
                    size="small"
                    onClick={(event) => handleAddRoute(event)}
                  />
                </>
              )}
              {isElseBranch(branchIndex) && <HorizontalSeparator noMargin />}
              <WorkflowIfElseBranchEditor
                action={action}
                branch={branch}
                branchIndex={branchIndex}
                branchLabel={getBranchLabel({
                  branchIndex,
                  totalBranches: branches.length,
                  branch,
                })}
                branchFilterGroup={branchFilterGroup}
                readonly={actionOptions.readonly === true}
                onSettingsUpdate={onSettingsUpdate}
                onFilterSettingsUpdate={onFilterSettingsUpdate}
              />
            </Fragment>
          );
        })}
      </StyledContainer>
    </StyledBodyContainer>
  );
};
