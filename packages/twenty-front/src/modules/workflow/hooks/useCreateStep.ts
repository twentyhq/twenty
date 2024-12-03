import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/states/workflowCreateStepFromParentStepIdState';
import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/states/workflowDiagramTriggerNodeSelectionState';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import {
  WorkflowStepType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useCreateWorkflowVersionStep } from '@/workflow/hooks/useCreateWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';

export const useCreateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { openRightDrawer } = useRightDrawer();
  const { createWorkflowVersionStep } = useCreateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const workflowCreateStepFromParentStepId = useRecoilValue(
    workflowCreateStepFromParentStepIdState,
  );

  const setWorkflowDiagramTriggerNodeSelection = useSetRecoilState(
    workflowDiagramTriggerNodeSelectionState,
  );

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const createStep = async (newStepType: WorkflowStepType) => {
    if (!isDefined(workflowCreateStepFromParentStepId)) {
      throw new Error('Select a step to create a new step from first.');
    }

    const workflowVersion = await getUpdatableWorkflowVersion(workflow);

    const createdStep = (
      await createWorkflowVersionStep({
        workflowVersionId: workflowVersion.id,
        stepType: newStepType,
      })
    )?.data?.createWorkflowVersionStep;

    if (!createdStep) {
      return;
    }

    setWorkflowSelectedNode(createdStep.id);
    openRightDrawer(RightDrawerPages.WorkflowStepEdit);

    /**
     * After the step has been created, select it.
     * As the `insertNodeAndSave` function mutates the cached workflow before resolving,
     * we are sure that the new node will have been created at this stage.
     *
     * Selecting the node will cause a right drawer to open in order to edit the step.
     */
    setWorkflowDiagramTriggerNodeSelection(createdStep.id);
  };

  return {
    createStep,
  };
};
