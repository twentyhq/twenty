import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import {
  SidePanelWorkflowSelectAction,
  type WorkflowActionSelection,
} from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const SidePanelWorkflowCreateStepContent = () => {
  const { getIcon } = useIcons();
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const { createStep } = useCreateStep();
  const { updateStep } = useUpdateStep();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const { openWorkflowEditStepInSidePanel } = useSidePanelWorkflowNavigation();
  const { closeRightClickMenu } = useCloseRightClickMenu();
  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
  );

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useAtomComponentState(workflowInsertStepIdsComponentState);

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

  const handleCreateStep = async (selection: WorkflowActionSelection) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(
        'Workflow ID must be configured for the edge when creating a step',
      );
    }

    const { parentStepId, nextStepId, position, connectionOptions } =
      workflowInsertStepIds;

    const createdStep = await createStep({
      newStepType: selection.type,
      parentStepId,
      nextStepId,
      position,
      connectionOptions,
      defaultSettings: selection.defaultSettings,
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

    setSidePanelNavigationStack([]);

    openWorkflowEditStepInSidePanel(
      workflowVisualizerWorkflowId,
      createdStep.name,
      getIcon(getActionIcon(createdStep.type as WorkflowActionType)),
      createdStep.id,
    );
  };

  return <SidePanelWorkflowSelectAction onActionSelected={handleCreateStep} />;
};
