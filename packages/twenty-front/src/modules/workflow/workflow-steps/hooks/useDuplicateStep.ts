import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useDuplicateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useDuplicateWorkflowVersionStep';
import { type Difference } from 'microdiff';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDuplicateStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { duplicateWorkflowVersionStep } = useDuplicateWorkflowVersionStep();
  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowLastCreatedStepId = useSetRecoilComponentState(
    workflowLastCreatedStepIdComponentState,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const duplicateStep = async ({ stepId }: { stepId: string }) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId = await getUpdatableWorkflowVersion();

      const workflowVersionStepChanges = (
        await duplicateWorkflowVersionStep({
          workflowVersionId,
          stepId,
        })
      )?.data?.duplicateWorkflowVersionStep;

      const stepsDiff = workflowVersionStepChanges?.stepsDiff as Difference[];
      const createdStepDiff = stepsDiff?.find((diff) => diff.type === 'CREATE');

      if (!isDefined(createdStepDiff)) {
        throw new Error("Couldn't duplicate step");
      }

      setWorkflowSelectedNode(createdStepDiff.value.id);
      setWorkflowLastCreatedStepId(createdStepDiff.value.id);

      return createdStepDiff.value;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    duplicateStep,
  };
};
