import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import {
  CREATE_AI_AGENT_CONFIG,
  CreateAiAgentConfigInput,
  CreateAiAgentConfigResponse,
} from '../services/aiAgentWorkflowService';

export const useCreateAiAgentConfig = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const apolloCoreClient = useApolloCoreClient();

  const [createAiAgentConfigMutation, { loading, error, data }] = useMutation<
    { createAiAgentConfig: CreateAiAgentConfigResponse },
    { input: CreateAiAgentConfigInput }
  >(CREATE_AI_AGENT_CONFIG, {
    client: apolloCoreClient,
    onCompleted: (data) => {
      if (data?.createAiAgentConfig?.id) {
        enqueueSuccessSnackBar({
          message: 'AI workflow configuration saved successfully!',
          options: { duration: 3000 },
        });
      }
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: `Failed to save AI workflow configuration: ${error.message}`,
        options: { duration: 5000 },
      });
    },
  });

  const createAiAgentConfig = async (input: CreateAiAgentConfigInput) => {
    try {
      const result = await createAiAgentConfigMutation({
        variables: { input },
      });
      return result.data?.createAiAgentConfig;
    } catch (err) {
      // Error is already handled by onError callback
      throw err;
    }
  };

  return {
    createAiAgentConfig,
    loading,
    error,
    data,
  };
};
