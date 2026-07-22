import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { SEND_MESSAGE_CAMPAIGN_TEST } from '@/activities/emails/graphql/mutations/sendMessageCampaignTest';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type SendMessageCampaignTestMutation,
  type SendMessageCampaignTestMutationVariables,
} from '~/generated-metadata/graphql';

type SendMessageCampaignTestParams = {
  toAddress: string;
  unsubscribeTopicId?: string;
  subject: string;
  body: string;
  fromAddress: string;
};

export const useSendMessageCampaignTest = () => {
  const [sendMessageCampaignTestMutation, { loading }] = useMutation<
    SendMessageCampaignTestMutation,
    SendMessageCampaignTestMutationVariables
  >(SEND_MESSAGE_CAMPAIGN_TEST);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendMessageCampaignTest = useCallback(
    async (params: SendMessageCampaignTestParams): Promise<boolean> => {
      try {
        const result = await sendMessageCampaignTestMutation({
          variables: { input: params },
        });

        if (!result.data?.sendMessageCampaignTest) {
          enqueueErrorSnackBar({ message: t`Failed to send test email` });

          return false;
        }

        enqueueSuccessSnackBar({
          message: t`Test email sent to ${params.toAddress}`,
        });

        return true;
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error
              ? error.message
              : t`Failed to send test email`,
        });

        return false;
      }
    },
    [
      sendMessageCampaignTestMutation,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
    ],
  );

  return { sendMessageCampaignTest, loading };
};
