import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import {
  AiAgentConfig,
  UPDATE_AI_AGENT_CONFIG,
  UpdateAiAgentConfigInput
} from '../services/aiAgentWorkflowService';

export const useUpdateAiAgentConfig = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [updateAiAgentConfigMutation, { loading, error, data }] = useMutation<
    { updateAiAgentConfig: AiAgentConfig },
    { id: string; input: UpdateAiAgentConfigInput }
  >(UPDATE_AI_AGENT_CONFIG, {
    onCompleted: (data) => {
      if (data?.updateAiAgentConfig?.id) {
        enqueueSuccessSnackBar({
          message: 'AI workflow configuration updated successfully!',
          options: { duration: 3000 },
        });
      }
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: `Failed to update AI workflow configuration: ${error.message}`,
        options: { duration: 5000 },
      });
    },
  });

  const updateAiAgentConfig = async (id: string, input: UpdateAiAgentConfigInput) => {
    try {
      const result = await updateAiAgentConfigMutation({
        variables: { id, input },
      });
      return result.data?.updateAiAgentConfig;
    } catch (err) {
      // Error is already handled by onError callback
      throw err;
    }
  };

  return {
    updateAiAgentConfig,
    loading,
    error,
    data,
  };
}; 