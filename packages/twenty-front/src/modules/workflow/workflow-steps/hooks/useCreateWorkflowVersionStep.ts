import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/primitives/feedback';
import {
  CreateCoreWorkflowVersionStepDocument,
  type CreateWorkflowVersionStepInput,
  type CreateWorkflowVersionStepMutation,
  type CreateWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useCreateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const [mutateCore] = useMutation(CreateCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const { enqueueToast } = useToast();

  const [mutate] = useMutation<
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >(CREATE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
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

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    if (isCore) {
      await invalidateCoreWorkflowVersions(apolloCoreClient);
    }

    return result;
  };

  return { createWorkflowVersionStep };
};
