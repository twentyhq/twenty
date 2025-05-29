import { UPDATE_CHATBOT_FLOW } from '@/chatbot/graphql/mutation/updateChatbotFlow';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { UpdateChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

interface UseUpdateChatbotFlowReturn {
  updateFlow: (updateChatbotInput: UpdateChatbotFlow) => Promise<any>;
}

export const useUpdateChatbotFlow = (): UseUpdateChatbotFlowReturn => {
  const { enqueueSnackBar } = useSnackBar();
  const setChatbotFlow = useSetRecoilState(chatbotFlowState);

  const [updateChatbotFlow, { data }] = useMutation(UPDATE_CHATBOT_FLOW, {
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

  useEffect(() => {
    if (!data) {
      return;
    }

    setChatbotFlow(data?.updateChatbotFlow);
  }, [data]);

  const updateFlow = async (updateChatbotInput: UpdateChatbotFlow) => {
    await updateChatbotFlow({
      variables: { updateChatbotInput },
    });
  };

  return {
    updateFlow,
  };
};
