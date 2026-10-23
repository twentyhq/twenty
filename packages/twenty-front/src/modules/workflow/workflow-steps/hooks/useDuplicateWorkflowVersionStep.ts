import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import {
  DuplicateCoreWorkflowVersionStepDocument,
  type DuplicateCoreWorkflowVersionStepInput,
} from '~/generated/graphql';

export type DuplicateWorkflowVersionStepInput = Omit<
  DuplicateCoreWorkflowVersionStepInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useDuplicateWorkflowVersionStep = () => {
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow();
  const apolloCoreClient = useApolloCoreClient();
  const handleCoreMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutateCore] = useMutation(DuplicateCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
    onError: handleCoreMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const duplicateWorkflowVersionStep = async (
    input: DuplicateWorkflowVersionStepInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    await savePendingWorkflowFlow();

    const result = await mutateCore({
      variables: {
        input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
      },
    });

    const workflowVersionStepChanges =
      result?.data?.duplicateWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result;
  };

  return { duplicateWorkflowVersionStep };
};
