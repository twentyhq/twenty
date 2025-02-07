import { SEND_TEMPLATE } from '@/chat/call-center/graphql/mutation/sendWhatsappTemplateMessage';
import { SendTemplateInput } from '@/chat/call-center/types/SendTemplateInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface SendTemplateReturn {
  sendWhatsappTemplateMessage: (
    sendTemplateInput: SendTemplateInput,
  ) => Promise<void>;
}

export const useWhatsappTemplateMessage = (): SendTemplateReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [sendTemplateMutation] = useMutation(SEND_TEMPLATE, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const sendWhatsappTemplateMessage = async (
    sendTemplateInput: SendTemplateInput,
  ) => {
    await sendTemplateMutation({
      variables: {
        sendTemplateInput,
      },
    });
  };

  return {
    sendWhatsappTemplateMessage,
  };
};
