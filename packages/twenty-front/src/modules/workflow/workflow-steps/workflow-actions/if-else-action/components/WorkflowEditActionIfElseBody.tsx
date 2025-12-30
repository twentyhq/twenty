import { InputLabel } from '@/ui/input/components/InputLabel';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { WorkflowIfElseBranchEditor } from '@/workflow/workflow-steps/workflow-actions/if-else-action/components/WorkflowIfElseBranchEditor';
import { calculateElseIfBranchPosition } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/calculateElseIfBranchPosition';
import { createElseIfBranch } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/createElseIfBranch';
import { getBranchesToDelete } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchesToDelete';
import { getBranchLabel } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchLabel';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';
import {
  type StepFilter,
  type StepFilterGroup,
  type StepIfElseBranch,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

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

const isElseBranch = (
  branchIndex: number,
  totalBranches: number,
  branch: StepIfElseBranch,
) => branchIndex === totalBranches - 1 && !isDefined(branch.filterGroupId);

export const WorkflowEditActionIfElseBody = ({
  action,
  actionOptions,
}: WorkflowEditActionIfElseBodyProps) => {
  const branches = action.settings.input.branches;
  const stepFilterGroups = action.settings.input.stepFilterGroups ?? [];
  const stepFilters = action.settings.input.stepFilters ?? [];
  const isReadonly = actionOptions.readonly === true;

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
    if (isReadonly) {
      return;
    }

    const updatedStepFilterGroups = newFilterSettings.stepFilterGroups ?? [];
    const updatedStepFilters = newFilterSettings.stepFilters ?? [];

    const remainingFilterGroupIds = new Set(
      updatedStepFilterGroups.map((g) => g.id),
    );

    const branchesToDelete = getBranchesToDelete(
      branches,
      remainingFilterGroupIds,
    );
    const updatedBranches =
      branchesToDelete.length > 0
        ? branches.filter((branch) => !branchesToDelete.includes(branch))
        : branches;

    setCurrentStepFilterGroups(updatedStepFilterGroups);
    setCurrentStepFilters(updatedStepFilters);

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

  const handleAddRoute = async (event?: React.MouseEvent<HTMLElement>) => {
    if (isDefined(event)) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isReadonly) {
      return;
    }

    const { filterGroup, filter, branchId, filterGroupId } =
      createElseIfBranch();
    const elseIfBranchIndex = branches.length - 1;
    const emptyNodePosition = calculateElseIfBranchPosition(
      elseIfBranchIndex,
      action.position ?? { x: 0, y: 0 },
    );

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
      id: branchId,
      filterGroupId,
      nextStepIds: [emptyNode.id],
    };

    const updatedBranches = [...branches];
    updatedBranches.splice(branches.length - 1, 0, newBranch);

    const updatedStepFilterGroups = [...stepFilterGroups, filterGroup];
    const updatedStepFilters = [...stepFilters, filter];

    setCurrentStepFilterGroups([...currentStepFilterGroups, filterGroup]);
    setCurrentStepFilters([...currentStepFilters, filter]);

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

  return (
    <StyledBodyContainer>
      <InputLabel>{t`Conditions`}</InputLabel>
      <StyledContainer>
        {branches.map((branch, branchIndex) => {
          const branchFilterGroup = isDefined(branch.filterGroupId)
            ? stepFilterGroups.find((g) => g.id === branch.filterGroupId)
            : undefined;

          const isElse = isElseBranch(branchIndex, branches.length, branch);

          return (
            <Fragment key={branch.id}>
              {branchIndex > 0 && !isElse && <HorizontalSeparator noMargin />}
              {isElse && !isReadonly && (
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
              {isElse && <HorizontalSeparator noMargin />}
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
                readonly={isReadonly}
                onFilterSettingsUpdate={onFilterSettingsUpdate}
              />
            </Fragment>
          );
        })}
      </StyledContainer>
    </StyledBodyContainer>
  );
};
