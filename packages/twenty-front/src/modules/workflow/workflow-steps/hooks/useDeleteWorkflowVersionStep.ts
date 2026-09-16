import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/primitives/feedback';
import {
  DeleteCoreWorkflowVersionStepDocument,
  type DeleteWorkflowVersionStepInput,
  type DeleteWorkflowVersionStepMutation,
  type DeleteWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useDeleteWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const [mutateCore] = useMutation(DeleteCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();
  const { enqueueToast } = useToast();

  const { findOneRecordQuery: findOneWorkflowVersionQuery } =
    useFindOneRecordQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const [mutate] = useMutation<
    DeleteWorkflowVersionStepMutation,
    DeleteWorkflowVersionStepMutationVariables
  >(DELETE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const deleteWorkflowVersionStep = async (
    input: DeleteWorkflowVersionStepInput,
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
          awaitRefetchQueries: true,
          refetchQueries: [
            {
              query: findOneWorkflowVersionQuery,
              variables: { objectRecordId: input.workflowVersionId },
            },
          ],
          onError: (error) => {
            enqueueToast(getToastOptionsFromError({ error }));
          },
        });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    if (isCore) {
      await invalidateCoreWorkflowVersions(apolloCoreClient);
    }

    return workflowVersionStepChanges;
  };

  return { deleteWorkflowVersionStep };
};
