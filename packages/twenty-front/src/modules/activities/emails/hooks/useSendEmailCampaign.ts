import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { SEND_EMAIL_CAMPAIGN } from '@/activities/emails/graphql/mutations/sendEmailCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';

type SendEmailCampaignParams = {
  emailListId: string;
  subject: string;
  body: string;
  fromAddress: string;
};

type SendEmailCampaignResult = {
  sendEmailCampaign: {
    campaignId: string;
    sentCount: number;
    failedCount: number;
  };
};

export const useSendEmailCampaign = () => {
  const [sendEmailCampaignMutation, { loading }] =
    useMutation<SendEmailCampaignResult>(SEND_EMAIL_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendEmailCampaign = useCallback(
    async (params: SendEmailCampaignParams): Promise<boolean> => {
      try {
        const result = await sendEmailCampaignMutation({
          variables: { input: params },
        });

        const sent = result.data?.sendEmailCampaign;

        if (sent) {
          enqueueSuccessSnackBar({
            message: t`Campaign sent to ${sent.sentCount} recipient(s)${
              sent.failedCount > 0 ? `, ${sent.failedCount} skipped` : ''
            }`,
          });

          return true;
        }

        enqueueErrorSnackBar({ message: t`Failed to send campaign` });

        return false;
      } catch {
        enqueueErrorSnackBar({ message: t`Failed to send campaign` });

        return false;
      }
    },
    [sendEmailCampaignMutation, enqueueSuccessSnackBar, enqueueErrorSnackBar],
  );

  return { sendEmailCampaign, loading };
};
