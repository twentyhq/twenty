import { TOGGLE_AGENT_STATUS } from '@/settings/service-center/agents/graphql/mutation/toggleAgentStatus';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseToggleAgentStatusByIdReturn {
  toggleAgentStatus: (agentId: string) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

export const useToggleAgentStatus = (): UseToggleAgentStatusByIdReturn => {
  const { enqueueSnackBar } = useSnackBar();
  // const { t } = useTranslation();

  const [toggleAgentStatusMutation, { loading, error }] = useMutation(
    TOGGLE_AGENT_STATUS,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Successful agent status change', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const toggleAgentStatus = async (agentId: string) => {
    try {
      await toggleAgentStatusMutation({
        variables: { agentId },
      });
    } catch (err) {
      enqueueSnackBar('Error toggling agent status', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    toggleAgentStatus,
    loading,
    error,
  };
};
