import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import {
  DuplicateCoreWorkflowVersionStepDocument,
  type DuplicateCoreWorkflowVersionStepInput,
} from '~/generated/graphql';

type DuplicateWorkflowVersionStepInput = Omit<
  DuplicateCoreWorkflowVersionStepInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useDuplicateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutate] = useMutation(DuplicateCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const duplicateWorkflowVersionStep = async (
    input: DuplicateWorkflowVersionStepInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = await mutate({
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
