import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { useApolloClient, useMutation } from '@apollo/client';
import {
  RunWorkflowVersionMutation,
  RunWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useRunWorkflowVersion = () => {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    RunWorkflowVersionMutation,
    RunWorkflowVersionMutationVariables
  >(RUN_WORKFLOW_VERSION, {
    client: apolloClient,
  });

  const { findOneRecord: findOneWorkflowRun } =
    useLazyFindOneRecord<WorkflowRun>({
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const runWorkflowVersion = async ({
    workflowVersionId,
    payload,
  }: {
    workflowVersionId: string;
    payload?: Record<string, any>;
  }) => {
    const { data } = await mutate({
      variables: { input: { workflowVersionId, payload } },
    });

    const workflowRunId = data?.runWorkflowVersion?.workflowRunId;

    await findOneWorkflowRun({
      objectRecordId: workflowRunId,
      onCompleted: (workflowRun) => {
        openRecordInCommandMenu({
          objectNameSingular: CoreObjectNameSingular.WorkflowRun,
          recordId: workflowRun.id,
        });
      },
    });
  };

  return { runWorkflowVersion };
};
