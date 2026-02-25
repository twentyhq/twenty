import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import {
  CommandMenuWorkflowSelectAction,
  type WorkflowActionSelection,
} from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectAction';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  type WorkflowAction,
  type WorkflowActionType,
} from '@/workflow/types/Workflow';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const CommandMenuWorkflowEditStepTypeContent = () => {
  const { getIcon } = useIcons();
  const workflowSelectedNode = useAtomComponentStateValue(
    workflowSelectedNodeComponentState,
  );
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const flow = useFlowOrThrow();

  const { updateStep } = useUpdateStep();

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();
  const { closeRightClickMenu } = useCloseRightClickMenu();
  const setCommandMenuNavigationStack = useSetAtomState(
    commandMenuNavigationStackState,
  );

  const handleUpdateStepType = async (selection: WorkflowActionSelection) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(
        'Workflow ID must be configured for the edge when creating a step',
      );
    }

    const existingStep = flow.steps?.find(
      (step) => step.id === workflowSelectedNode,
    );

    if (!isDefined(existingStep)) {
      throw new Error('Step not found');
    }

    const stepUpdate = {
      ...existingStep,
      type: selection.type,
      settings: selection.defaultSettings ?? existingStep.settings,
    };

    const { updatedStep } = await updateStep(stepUpdate as WorkflowAction);

    if (!isDefined(updatedStep)) {
      return;
    }

    closeRightClickMenu();

    setCommandMenuNavigationStack([]);

    openWorkflowEditStepInCommandMenu(
      workflowVisualizerWorkflowId,
      updatedStep.name,
      getIcon(getActionIcon(updatedStep.type as WorkflowActionType)),
      updatedStep.id,
    );
  };

  return (
    <CommandMenuWorkflowSelectAction onActionSelected={handleUpdateStepType} />
  );
};
