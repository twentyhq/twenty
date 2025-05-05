import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import {
  WorkflowStepType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useCreateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep';
import { workflowCreateStepFromParentStepIdComponentState } from '@/workflow/workflow-steps/states/workflowCreateStepFromParentStepIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useCreateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { createWorkflowVersionStep } = useCreateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowLastCreatedStepId = useSetRecoilComponentStateV2(
    workflowLastCreatedStepIdComponentState,
  );

  const workflowCreateStepFromParentStepId = useRecoilComponentValueV2(
    workflowCreateStepFromParentStepIdComponentState,
  );

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const createStep = async (newStepType: WorkflowStepType) => {
    if (!isDefined(workflowCreateStepFromParentStepId)) {
      throw new Error('Select a step to create a new step from first.');
    }

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

    const createdStep = (
      await createWorkflowVersionStep({
        workflowVersionId,
        stepType: newStepType,
        parentStepId: workflowCreateStepFromParentStepId,
        nextStepId: undefined,
      })
    )?.data?.createWorkflowVersionStep;

    if (!createdStep) {
      return;
    }

    setWorkflowSelectedNode(createdStep.id);
    setWorkflowLastCreatedStepId(createdStep.id);
  };

  return {
    createStep,
  };
};
