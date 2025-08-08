import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import {
  WorkflowStepType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useCreateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCreateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion | undefined;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkflowVersionStep } = useCreateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowLastCreatedStepId = useSetRecoilComponentState(
    workflowLastCreatedStepIdComponentState,
  );

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  if (!isDefined(workflow)) {
    return {
      createStep: async () => undefined,
    };
  }

  const createStep = async ({
    newStepType,
    parentStepId,
    nextStepId,
    position,
  }: {
    newStepType: WorkflowStepType;
    parentStepId: string | undefined;
    nextStepId: string | undefined;
    position?: { x: number; y: number };
  }) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

      if (!isDefined(workflowVersionId)) {
        throw new Error("Couldn't get updatable workflow version");
      }

      const workflowVersionStepChanges = (
        await createWorkflowVersionStep({
          workflowVersionId,
          stepType: newStepType,
          parentStepId,
          nextStepId,
          position,
        })
      )?.data?.createWorkflowVersionStep;

      const createdStep = workflowVersionStepChanges?.createdStep;

      if (!isDefined(createdStep)) {
        throw new Error("Couldn't create step");
      }

      setWorkflowSelectedNode(createdStep.id);
      setWorkflowLastCreatedStepId(createdStep.id);

      return createdStep;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStep,
  };
};
