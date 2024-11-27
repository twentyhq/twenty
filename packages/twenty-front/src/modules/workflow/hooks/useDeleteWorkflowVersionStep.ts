import { useApolloClient, useMutation } from '@apollo/client';
import {
  DeleteWorkflowVersionStepMutation,
  DeleteWorkflowVersionStepMutationVariables,
  DeleteWorkflowVersionStepInput,
} from '~/generated/graphql';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';

export const useDeleteWorkflowVersionStep = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const apolloClient = useApolloClient();
  const { findOneRecord } = useLazyFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordGqlFields: {
      id: true,
      name: true,
      statuses: true,
      versions: true,
    },
  });

  const [mutate] = useMutation<
    DeleteWorkflowVersionStepMutation,
    DeleteWorkflowVersionStepMutationVariables
  >(DELETE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });
  const deleteWorkflowVersionStep = async (
    input: DeleteWorkflowVersionStepInput,
  ) => {
    await mutate({ variables: { input } });
    await findOneRecord({ objectRecordId: workflowId });
  };

  return { deleteWorkflowVersionStep };
};
