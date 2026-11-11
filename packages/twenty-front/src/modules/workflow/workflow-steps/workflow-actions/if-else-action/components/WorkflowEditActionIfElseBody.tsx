import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
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
import { getBranchLabel } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchLabel';
import { getBranchesToDelete } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchesToDelete';
import { removeIfElseBranchFilterRows } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/removeIfElseBranchFilterRows';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  computeIfElseBranchConditionFromFilter,
  type StepIfElseBranch,
} from 'twenty-shared/workflow';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
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
  const { t } = useLingui();
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
  const flow = useAtomComponentStateValue(flowComponentState);

  const currentStepFilters = useAtomComponentStateValue(
    currentStepFiltersComponentState,
  );
  const currentStepFilterGroups = useAtomComponentStateValue(
    currentStepFilterGroupsComponentState,
  );
  const setCurrentStepFilters = useSetAtomComponentState(
    currentStepFiltersComponentState,
  );
  const setCurrentStepFilterGroups = useSetAtomComponentState(
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
    // A branch whose condition came from its rows follows them; a written expression stays
    const updatedBranches = branches
      .filter((branch) => !branchesToDelete.includes(branch))
      .map((branch) => {
        if (
          isNonEmptyString(branch.condition) &&
          branch.condition !==
            computeIfElseBranchConditionFromFilter({
              branch,
              stepFilterGroups,
              stepFilters,
            })
        ) {
          return branch;
        }

        const condition = computeIfElseBranchConditionFromFilter({
          branch,
          stepFilterGroups: updatedStepFilterGroups,
          stepFilters: updatedStepFilters,
        });

        return condition === branch.condition
          ? branch
          : { ...branch, condition };
      });

    await cleanupEmptyChildStepsFromDeletedBranches({
      branchesToDelete,
      allSteps: flow?.steps ?? undefined,
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

  const updateBranches = ({
    updatedBranch,
    filterSettings,
  }: {
    updatedBranch: StepIfElseBranch;
    filterSettings?: Required<FilterSettings>;
  }) => {
    if (isReadonly) {
      return;
    }

    if (isDefined(filterSettings)) {
      setCurrentStepFilterGroups(filterSettings.stepFilterGroups);
      setCurrentStepFilters(filterSettings.stepFilters);
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          ...filterSettings,
          branches: branches.map((branch) =>
            branch.id === updatedBranch.id ? updatedBranch : branch,
          ),
        },
      },
    });
  };

  // Rows can't hold a free expression, so editing one drops the branch's rows
  const handleBranchConditionChange = (
    branch: StepIfElseBranch,
    condition: string,
  ) => {
    if (!isDefined(branch.filterGroupId)) {
      return;
    }

    updateBranches({
      updatedBranch: { ...branch, condition },
      filterSettings: removeIfElseBranchFilterRows({
        branchFilterGroupId: branch.filterGroupId,
        stepFilterGroups: currentStepFilterGroups,
        stepFilters: currentStepFilters,
      }),
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
    <WorkflowStepBody rowGap={themeCssVariables.spacing[2]}>
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
              {branchIndex > 0 && !isElse && <Separator />}
              {isElse && !isReadonly && (
                <>
                  <Separator />
                  <Button
                    startIcon={<IconPlus />}
                    size="sm"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                      handleAddRoute(event)
                    }
                    variant="outline"
                  >{t`Add route`}</Button>
                </>
              )}
              <WorkflowIfElseBranchEditor
                action={action}
                branch={branch}
                branchIndex={branchIndex}
                branchLabel={getBranchLabel({
                  branchIndex,
                  totalBranches: branches.length,
                  branch,
                })}
                elseIfIndex={
                  branchIndex > 0 &&
                  branchIndex < branches.length - 1 &&
                  isDefined(branch.filterGroupId)
                    ? branchIndex
                    : undefined
                }
                branchFilterGroup={branchFilterGroup}
                conditionFromFilter={computeIfElseBranchConditionFromFilter({
                  branch,
                  stepFilterGroups,
                  stepFilters,
                })}
                readonly={isReadonly}
                onFilterSettingsUpdate={onFilterSettingsUpdate}
                onConditionSeed={(condition) =>
                  updateBranches({ updatedBranch: { ...branch, condition } })
                }
                onConditionChange={(condition) =>
                  handleBranchConditionChange(branch, condition)
                }
              />
            </Fragment>
          );
        })}
      </StyledContainer>
    </WorkflowStepBody>
  );
};
