import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  workflow: WorkflowWithCurrentVersion;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkflowVersionStep } = useCreateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowLastCreatedStepId = useSetRecoilComponentStateV2(
    workflowLastCreatedStepIdComponentState,
  );

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const createStep = async ({
    newStepType,
    parentStepId,
    nextStepId,
  }: {
    newStepType: WorkflowStepType;
    parentStepId: string;
    nextStepId: string | undefined;
  }) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

      const createdStep = (
        await createWorkflowVersionStep({
          workflowVersionId,
          stepType: newStepType,
          parentStepId,
          nextStepId,
        })
      )?.data?.createWorkflowVersionStep;

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
