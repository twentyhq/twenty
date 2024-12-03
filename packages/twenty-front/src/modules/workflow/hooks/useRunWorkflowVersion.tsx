import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { useMutation } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { IconSettingsAutomation } from 'twenty-ui';
import {
  RunWorkflowVersionMutation,
  RunWorkflowVersionMutationVariables,
} from '~/generated/graphql';
import { capitalize } from '~/utils/string/capitalize';

export const useRunWorkflowVersion = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    RunWorkflowVersionMutation,
    RunWorkflowVersionMutationVariables
  >(RUN_WORKFLOW_VERSION, {
    client: apolloMetadataClient,
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

    enqueueSnackBar('', {
      variant: SnackBarVariant.Success,
      title: `${capitalize(workflowName)} starting...`,
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
