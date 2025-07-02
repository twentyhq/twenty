import { UPDATE_AGENT } from '@/settings/service-center/agents/graphql/mutation/updateAgent';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { UpdateWorkspaceAgentInput } from '~/generated/graphql';

interface UseToggleAgentActiveReturn {
  editAgent: (updateAgentInput: UpdateWorkspaceAgentInput) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useUpdateAgent = (): UseToggleAgentActiveReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateAgent, { loading, error }] = useMutation(UPDATE_AGENT, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Agent updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const editAgent = async (updateInput: UpdateWorkspaceAgentInput) => {
    try {
      await updateAgent({
        variables: {
          updateInput,
        },
      });
    } catch (err) {
      enqueueSnackBar('Error updating agent', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    editAgent,
    loading,
    error,
  };
};
