import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { useApolloClient, useMutation } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { capitalize } from 'twenty-shared';
import { IconSettingsAutomation } from 'twenty-ui';
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

  const { enqueueSnackBar } = useSnackBar();

  const theme = useTheme();

  const runWorkflowVersion = async ({
    workflowVersionId,
    workflowName,
    payload,
  }: {
    workflowVersionId: string;
    workflowName: string;
    payload?: Record<string, any>;
  }) => {
    await mutate({
      variables: { input: { workflowVersionId, payload } },
    });

    enqueueSnackBar(`${capitalize(workflowName)} starting...`, {
      variant: SnackBarVariant.Success,
      icon: (
        <IconSettingsAutomation
          size={16}
          color={theme.snackBar.success.color}
        />
      ),
    });
  };

  return { runWorkflowVersion };
};
