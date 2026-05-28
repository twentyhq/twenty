import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { SEND_MESSAGE_CAMPAIGN } from '@/activities/campaigns/graphql/mutations/sendMessageCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type SendMessageCampaignInput = {
  name: string;
  subject: string;
  bodyTemplate: string;
  fromAddress: string;
  replyTo?: string;
  emailingDomainId: string;
  recipientFilter: RecordGqlOperationFilter;
};

type SendMessageCampaignResult = {
  campaignId: string;
  queuedRecipientCount: number;
  skippedRecipientCount: number;
};

export const useSendMessageCampaign = () => {
  const [sendCampaignMutation, { loading }] = useMutation<
    { sendMessageCampaign: SendMessageCampaignResult },
    { input: SendMessageCampaignInput }
  >(SEND_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendCampaign = useCallback(
    async (input: SendMessageCampaignInput): Promise<boolean> => {
      try {
        const result = await sendCampaignMutation({
          variables: { input },
        });

        if (result.data?.sendMessageCampaign) {
          const { queuedRecipientCount, skippedRecipientCount } =
            result.data.sendMessageCampaign;

          enqueueSuccessSnackBar({
            message:
              skippedRecipientCount > 0
                ? t`Campaign queued for ${queuedRecipientCount} recipients (${skippedRecipientCount} skipped — no email or cap reached).`
                : t`Campaign queued for ${queuedRecipientCount} recipients.`,
          });
          return true;
        }

        enqueueErrorSnackBar({
          message: t`Failed to send campaign`,
        });
        return false;
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error ? error.message : t`Failed to send campaign`,
        });
        return false;
      }
    },
    [sendCampaignMutation, enqueueSuccessSnackBar, enqueueErrorSnackBar],
  );

  return { sendCampaign, loading };
};
