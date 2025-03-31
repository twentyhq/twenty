import { UPDATE_CHATBOT_FLOW } from '@/chatbot/graphql/mutation/updateChatbotFlow';
import { UpdateChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseUpdateChatbotFlowReturn {
  updateFlow: (updateChatbotInput: UpdateChatbotFlow) => Promise<void>;
}

export const useUpdateChatbotFlow = (): UseUpdateChatbotFlowReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateChatbotFlow] = useMutation(UPDATE_CHATBOT_FLOW, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: () => {
      enqueueSnackBar('Flow updated successfully!', {
        variant: SnackBarVariant.Success,
      });
    },
  });

  const updateFlow = async (updateChatbotInput: UpdateChatbotFlow) => {
    await updateChatbotFlow({
      variables: { updateChatbotInput },
    });
  };

  return {
    updateFlow,
  };
};
