import { SEND_EVENT_MESSAGE } from '@/chat/call-center/graphql/mutation/sendWhatsappEventMessage';
import { SendEventMessageInput } from '@/chat/call-center/types/SendMessage';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendEventMessageReturn {
  sendWhatsappEventMessage: (
    sendEventMessageInput: SendEventMessageInput,
  ) => Promise<void>;
}

export const useSendWhatsappEventMessage = (): SendEventMessageReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [sendEventMessageMutation] = useMutation(SEND_EVENT_MESSAGE, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const sendEventMessage = async (
    sendEventMessageInput: SendEventMessageInput,
  ) => {
    await sendEventMessageMutation({
      variables: {
        sendEventMessageInput,
      },
    });
  };

  return {
    sendWhatsappEventMessage: sendEventMessage,
  };
};
