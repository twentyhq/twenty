import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { useCreateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep';
import {
  type Difference,
  type DifferenceChange,
  type DifferenceCreate,
} from 'microdiff';
import { useState } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

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
    shouldSelectNode = true,
    workflowVersionId: providedWorkflowVersionId,
  }: {
    newStepType: WorkflowActionType;
    parentStepId: string | undefined;
    nextStepId: string | undefined;
    position?: { x: number; y: number };
    connectionOptions?: WorkflowStepConnectionOptions;
    shouldSelectNode?: boolean;
    workflowVersionId?: string;
  }) => {
    if (isLoading === true) {
      return;
    }

    setIsLoading(true);

    try {
      const workflowVersionId =
        providedWorkflowVersionId ?? (await getUpdatableWorkflowVersion());
      const id = v4();

      const workflowVersionStepChanges = (
        await createWorkflowVersionStep({
          id,
          workflowVersionId,
          stepType: newStepType,
          parentStepId,
          nextStepId,
          position,
          parentStepConnectionOptions: connectionOptions,
        })
      )?.data?.createWorkflowVersionStep;

      const stepsDiff = workflowVersionStepChanges?.stepsDiff as Difference[];

      const addedStepDiff = stepsDiff?.find(
        (diff) => diff.type === 'CREATE' && diff.value.id === id,
      ) as Nullable<DifferenceCreate>;

      const createdFirstStepDiff = stepsDiff?.find(
        (diff) => diff.type === 'CHANGE' && diff.value?.[0]?.id === id,
      ) as Nullable<DifferenceChange>;

      if (!isDefined(createdFirstStepDiff) && !isDefined(addedStepDiff)) {
        throw new Error("Couldn't create step");
      }

      if (shouldSelectNode) {
        setWorkflowSelectedNode(id);
      }
      setWorkflowLastCreatedStepId(id);

      return isDefined(createdFirstStepDiff)
        ? createdFirstStepDiff.value[0]
        : addedStepDiff?.value;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStep,
  };
};
