import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { CREATE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/createWorkflowVersionEdge';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/primitives/feedback';
import {
  CreateCoreWorkflowVersionEdgeDocument,
  type CreateWorkflowVersionEdgeInput,
  type CreateWorkflowVersionEdgeMutation,
  type CreateWorkflowVersionEdgeMutationVariables,
} from '~/generated/graphql';

export const useCreateWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const [mutateCore] = useMutation(CreateCoreWorkflowVersionEdgeDocument, {
    client: apolloCoreClient,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();
  const { enqueueToast } = useToast();

  const [mutate] = useMutation<
    CreateWorkflowVersionEdgeMutation,
    CreateWorkflowVersionEdgeMutationVariables
  >(CREATE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const createWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = isCore
      ? await mutateCore({
          variables: {
            input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
          },
          onError: (error) => {
            enqueueToast(getToastOptionsFromError({ error }));
          },
        })
      : await mutate({
          variables: { input },
          onError: (error) => {
            enqueueToast(getToastOptionsFromError({ error }));
          },
        });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionEdge;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    if (isCore) {
      await invalidateCoreWorkflowVersions(apolloCoreClient);
    }

    return result;
  };

  return { createWorkflowVersionEdge };
};
