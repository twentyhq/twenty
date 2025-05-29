import { SEND_MESSAGE } from '@/chat/call-center/graphql/mutation/sendWhatsappMessage';
import { SendMessageInput } from '@/chat/call-center/types/SendMessage';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendMessageReturn {
  sendWhatsappMessage: (sendMessageInput: SendMessageInput) => Promise<void>;
}

export const useSendWhatsappMessages = (): SendMessageReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const sendWhatsappMessage = async (sendMessageInput: SendMessageInput) => {
    await sendMessageMutation({
      variables: {
        sendMessageInput: sendMessageInput,
      },
    });
  };

  return {
    sendWhatsappMessage,
  };
};

export type SendMessageType = ReturnType<
  typeof useSendWhatsappMessages
>['sendWhatsappMessage'];
