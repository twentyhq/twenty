import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import { type WorkflowStepType } from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { useCreateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCreateStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkflowVersionStep } = useCreateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowLastCreatedStepId = useSetRecoilComponentState(
    workflowLastCreatedStepIdComponentState,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const createStep = async ({
    newStepType,
    parentStepId,
    nextStepId,
    position,
    connectionOptions,
  }: {
    newStepType: WorkflowStepType;
    parentStepId: string | undefined;
    nextStepId: string | undefined;
    position?: { x: number; y: number };
    connectionOptions?: WorkflowStepConnectionOptions;
  }) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion();

      const workflowVersionStepChanges = (
        await createWorkflowVersionStep({
          workflowVersionId,
          stepType: newStepType,
          parentStepId,
          nextStepId,
          position,
          parentStepConnectionOptions: connectionOptions,
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
