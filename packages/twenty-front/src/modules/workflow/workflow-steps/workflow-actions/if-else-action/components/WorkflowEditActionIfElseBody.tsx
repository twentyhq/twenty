import { InputLabel } from '@/ui/input/components/InputLabel';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  type WorkflowIfElseAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useDeleteWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep';
import { WorkflowIfElseBranchEditor } from '@/workflow/workflow-steps/workflow-actions/if-else-action/components/WorkflowIfElseBranchEditor';
import { calculateElseIfBranchPosition } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/calculateElseIfBranchPosition';
import { calculateExistingBranchPositions } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/calculateExistingBranchPositions';
import { createElseIfBranch } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/createElseIfBranch';
import { getBranchesToDelete } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchesToDelete';
import { getBranchLabel } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchLabel';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type StepIfElseBranch } from 'twenty-shared/workflow';
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

export const WorkflowEditActionIfElseBody = ({
  action,
  actionOptions,
}: WorkflowEditActionIfElseBodyProps) => {
  const branches = action.settings.input.branches;
  const stepFilterGroups = action.settings.input.stepFilterGroups ?? [];
  const stepFilters = action.settings.input.stepFilters ?? [];
  const isReadonly = actionOptions.readonly === true;

  const { createStep } = useCreateStep();
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { updateWorkflowVersionPosition } = useTidyUpWorkflowVersion();
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { deleteStepsOutputSchema } = useStepsOutputSchema();
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

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

  const cleanupEmptyChildStepsFromDeletedBranches = async ({
    branchesToDelete,
    allSteps,
  }: {
    branchesToDelete: StepIfElseBranch[];
    allSteps?: WorkflowStep[];
  }): Promise<void> => {
    if (branchesToDelete.length === 0 || !isDefined(allSteps)) {
      return;
    }

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const childStepIdsFromDeletedBranches = branchesToDelete.flatMap(
      (branch) => branch.nextStepIds,
    );

    const emptyChildStepIds = childStepIdsFromDeletedBranches.filter(
      (childStepId) => {
        const childStep = allSteps.find((step) => step.id === childStepId);
        return isDefined(childStep) && childStep.type === 'EMPTY';
      },
    );

    for (const emptyChildStepId of emptyChildStepIds) {
      await deleteWorkflowVersionStep({
        workflowVersionId,
        stepId: emptyChildStepId,
      });
    }

    if (emptyChildStepIds.length > 0) {
      deleteStepsOutputSchema({
        stepIds: emptyChildStepIds,
        workflowVersionId,
      });
    }
  };

  const onFilterSettingsUpdate = async (newFilterSettings: FilterSettings) => {
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

    await cleanupEmptyChildStepsFromDeletedBranches({
      branchesToDelete,
      allSteps: workflow?.currentVersion?.steps ?? undefined,
    });

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
    const totalBranches = branches.length + 1;
    const elseIfBranchIndex = branches.length - 1;
    const ifElseStepPosition = action.position ?? { x: 0, y: 0 };

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const existingBranchPositions = calculateExistingBranchPositions({
      branches,
      elseIfBranchIndex,
      totalBranches,
      ifElseStepPosition,
    });

    const newEmptyNodePosition = calculateElseIfBranchPosition(
      elseIfBranchIndex,
      totalBranches,
      ifElseStepPosition,
    );

    if (existingBranchPositions.length > 0) {
      await updateWorkflowVersionPosition(
        workflowVersionId,
        existingBranchPositions,
      );
    }

    const emptyNode = await createStep({
      newStepType: 'EMPTY',
      parentStepId: undefined,
      nextStepId: undefined,
      position: newEmptyNodePosition,
      shouldSelectNode: false,
      workflowVersionId,
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

          const isElse =
            branchIndex === branches.length - 1 &&
            !isDefined(branch.filterGroupId);

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
