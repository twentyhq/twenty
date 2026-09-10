import { useMutation } from '@apollo/client/react';

import { SEND_MESSAGE_CAMPAIGN_TEST } from '@/activities/emails/graphql/mutations/sendMessageCampaignTest';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/feedback';
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

  const { enqueueToast } = useToast();
  const { enqueueErrorToast } = useErrorToast();

  const sendMessageCampaignTest = async (
    params: SendMessageCampaignTestParams,
  ): Promise<boolean> => {
    try {
      const result = await sendMessageCampaignTestMutation({
        variables: { input: params },
      });

      if (!result.data?.sendMessageCampaignTest) {
        enqueueToast({
          variant: 'error',
          children: t`Failed to send test email`,
        });

        return false;
      }

      enqueueToast({
        variant: 'success',
        children: t`Test email sent to ${params.toAddress}`,
      });

      return true;
    } catch (error) {
      enqueueErrorToast(error);

      return false;
    }
  };

  return { sendMessageCampaignTest, loading };
};
