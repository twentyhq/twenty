import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import {
  WorkflowStepType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useCreateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { isDefined } from 'twenty-shared/utils';
import { useState } from 'react';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

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

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentStateV2(workflowInsertStepIdsComponentState);

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const createStep = async (newStepType: WorkflowStepType) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      if (!isDefined(workflowInsertStepIds.parentStepId)) {
        throw new Error(
          'No parentStepId. Please select a parent step to create from.',
        );
      }

      const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

      const createdStep = (
        await createWorkflowVersionStep({
          workflowVersionId,
          stepType: newStepType,
          parentStepId: workflowInsertStepIds.parentStepId,
          nextStepId: workflowInsertStepIds.nextStepId,
        })
      )?.data?.createWorkflowVersionStep;

      if (!createdStep) {
        return;
      }

      setWorkflowSelectedNode(createdStep.id);
      setWorkflowLastCreatedStepId(createdStep.id);
      setWorkflowInsertStepIds({
        parentStepId: undefined,
        nextStepId: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStep,
  };
};
