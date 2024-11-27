import { useApolloClient, useMutation } from '@apollo/client';
import {
  CreateWorkflowVersionStepMutation,
  CreateWorkflowVersionStepMutationVariables,
  CreateWorkflowVersionStepInput,
} from '~/generated/graphql';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';

export const useCreateWorkflowVersionStep = ({
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
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >(CREATE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });
  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
    });
    await findOneRecord({ objectRecordId: workflowId });
    return result;
  };

  return { createWorkflowVersionStep };
};
