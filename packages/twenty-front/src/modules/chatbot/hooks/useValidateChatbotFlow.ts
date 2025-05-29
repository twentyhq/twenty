import { VALIDATE_CHATBOT_FLOW } from '@/chatbot/graphql/mutation/validateChatbotFlow';
import { ChatbotFlowInput } from '@/chatbot/types/chatbotFlow.type';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UseValidateChatbotFlowReturn {
  chatbotFlow: (chatbotInput: ChatbotFlowInput) => Promise<void>;
}

export const useValidateChatbotFlow = (): UseValidateChatbotFlowReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [validateChatbotFlow] = useMutation(VALIDATE_CHATBOT_FLOW, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const chatbotFlow = async (chatbotInput: ChatbotFlowInput) => {
    await validateChatbotFlow({
      variables: { chatbotInput },
    });
  };

  return {
    chatbotFlow,
  };
};
