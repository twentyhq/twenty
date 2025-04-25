import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { useApolloClient, useMutation } from '@apollo/client';
import {
  RunWorkflowVersionMutation,
  RunWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useRunWorkflowVersion = () => {
  const apolloClient = useApolloClient();
  const [runWorkflowVersionMutate] = useMutation<
    RunWorkflowVersionMutation,
    RunWorkflowVersionMutationVariables
  >(RUN_WORKFLOW_VERSION, {
    client: apolloClient,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const runWorkflowVersion = async ({
    workflowVersionId,
    payload,
  }: {
    workflowVersionId: string;
    payload?: Record<string, any>;
  }) => {
    const { data } = await runWorkflowVersionMutate({
      variables: { input: { workflowVersionId, payload } },
    });

    const workflowRunId = data?.runWorkflowVersion?.workflowRunId;

    openRecordInCommandMenu({
      recordId: workflowRunId,
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    });
  };

  return { runWorkflowVersion };
};
