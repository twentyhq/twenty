import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import {
  WorkflowStepType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { useCreateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/workflow-steps/states/workflowCreateStepFromParentStepIdState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCreateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { createWorkflowVersionStep } = useCreateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const setWorkflowLastCreatedStepId = useSetRecoilComponentStateV2(
    workflowLastCreatedStepIdComponentState,
  );

  const workflowCreateStepFromParentStepId = useRecoilValue(
    workflowCreateStepFromParentStepIdState,
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
