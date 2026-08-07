import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

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

  const sendMessageCampaignTest = async (
    params: SendMessageCampaignTestParams,
  ): Promise<boolean> => {
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
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });

      return false;
    }
  };

  return { sendMessageCampaignTest, loading };
};
