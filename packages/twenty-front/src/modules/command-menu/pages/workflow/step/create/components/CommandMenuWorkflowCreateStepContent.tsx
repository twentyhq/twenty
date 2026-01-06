import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { CommandMenuWorkflowSelectAction } from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectAction';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  type WorkflowActionType,
  type WorkflowIfElseAction,
} from '@/workflow/types/Workflow';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { prepareIfElseStepWithNewBranch } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/prepareIfElseStepWithNewBranch';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const CommandMenuWorkflowCreateStepContent = () => {
  const { getIcon } = useIcons();
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const { createStep } = useCreateStep();
  const { updateStep } = useUpdateStep();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();
  const { closeRightClickMenu } = useCloseRightClickMenu();
  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentState(workflowInsertStepIdsComponentState);

  const handleIfElseParentStep = async ({
    parentStep,
    createdStepId,
  }: {
    parentStep: WorkflowIfElseAction;
    createdStepId: string;
  }) => {
    const updatedStep = prepareIfElseStepWithNewBranch({
      parentStep,
      targetStepId: createdStepId,
    });

    await updateStep(updatedStep);
  };

  const handleCreateStep = async (actionType: WorkflowActionType) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(
        'Workflow ID must be configured for the edge when creating a step',
      );
    }

    const { parentStepId, nextStepId, position, connectionOptions } =
      workflowInsertStepIds;

    const createdStep = await createStep({
      newStepType: actionType,
      parentStepId,
      nextStepId,
      position,
      connectionOptions,
    });

    if (!isDefined(createdStep)) {
      return;
    }

    const steps = workflowWithCurrentVersion?.currentVersion?.steps;
    const parentStep =
      isDefined(parentStepId) && isDefined(steps) && isDefined(position)
        ? steps.find((step) => step.id === parentStepId)
        : undefined;

    if (parentStep?.type === 'IF_ELSE') {
      await handleIfElseParentStep({
        parentStep,
        createdStepId: createdStep.id,
      });
    }

    setWorkflowInsertStepIds({
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
    });

    closeRightClickMenu();

    setCommandMenuNavigationStack([]);

    openWorkflowEditStepInCommandMenu(
      workflowVisualizerWorkflowId,
      createdStep.name,
      getIcon(getActionIcon(createdStep.type as WorkflowActionType)),
      createdStep.id,
    );
  };

  return (
    <CommandMenuWorkflowSelectAction onActionSelected={handleCreateStep} />
  );
};
