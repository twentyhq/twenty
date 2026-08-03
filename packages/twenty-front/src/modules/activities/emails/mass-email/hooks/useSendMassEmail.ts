import { useMutation } from '@apollo/client/react';
import { useCallback, useState } from 'react';

import { SEND_MASS_EMAIL_CAMPAIGN } from '@/activities/emails/mass-email/graphql/massEmailCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
type MassEmailToSend = {
  personId: string;
  to: string;
  subject: string;
  body: string;
};

type SendMassEmailParams = {
  campaignId: string;
  connectedAccountId: string;
  emails: MassEmailToSend[];
};

type SendMassEmailResult = {
  sentCount: number;
  failedRecipients: string[];
};

export const useSendMassEmail = () => {
  const [sendMassEmailCampaignMutation] = useMutation<
    {
      sendMassEmailCampaign: {
        campaignId: string;
        sentCount: number;
        failedRecipients: string[];
      };
    },
    { input: SendMassEmailParams }
  >(SEND_MASS_EMAIL_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const sendMassEmail = useCallback(
    async ({
      campaignId,
      connectedAccountId,
      emails,
    }: SendMassEmailParams): Promise<SendMassEmailResult> => {
      setSending(true);
      setSentCount(0);

      try {
        const result = await sendMassEmailCampaignMutation({
          variables: {
            input: { campaignId, connectedAccountId, emails },
          },
        });
        const sentCampaign = result.data?.sendMassEmailCampaign;

        if (sentCampaign === undefined) {
          throw new Error('Failed to send campaign');
        }

        setSentCount(sentCampaign.sentCount);

        const { sentCount: successCount, failedRecipients } = sentCampaign;

        if (failedRecipients.length === 0) {
          enqueueSuccessSnackBar({
            message: t`${successCount} emails sent`,
          });
        } else {
          enqueueErrorSnackBar({
            message: t`Sent ${successCount} of ${emails.length} emails. Failed: ${failedRecipients.join(', ')}`,
          });
        }

        return { sentCount: successCount, failedRecipients };
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error ? error.message : t`Failed to send emails`,
        });

        return {
          sentCount: 0,
          failedRecipients: emails.map(({ to }) => to),
        };
      } finally {
        setSending(false);
      }
    },
    [
      sendMassEmailCampaignMutation,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
    ],
  );

  return { sendMassEmail, sending, sentCount };
};
