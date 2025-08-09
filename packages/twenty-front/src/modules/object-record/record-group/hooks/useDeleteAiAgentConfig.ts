import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { DELETE_AI_AGENT_CONFIG } from '../services/aiAgentWorkflowService';

export const useDeleteAiAgentConfig = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [deleteAiAgentConfigMutation, { loading, error, data }] = useMutation<
    { deleteAiAgentConfig: boolean },
    { id: string }
  >(DELETE_AI_AGENT_CONFIG, {
    onCompleted: (data) => {
      if (data?.deleteAiAgentConfig) {
        enqueueSuccessSnackBar({
          message: 'AI workflow configuration deleted successfully!',
          options: { duration: 3000 },
        });
      }
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: `Failed to delete AI workflow configuration: ${error.message}`,
        options: { duration: 5000 },
      });
    },
  });

  const deleteAiAgentConfig = async (id: string) => {
    try {
      const result = await deleteAiAgentConfigMutation({
        variables: { id },
      });
      return result.data?.deleteAiAgentConfig;
    } catch (err) {
      // Error is already handled by onError callback
      throw err;
    }
  };

  return {
    deleteAiAgentConfig,
    loading,
    error,
    data,
  };
}; 