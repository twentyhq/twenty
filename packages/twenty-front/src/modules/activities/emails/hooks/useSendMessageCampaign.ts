import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { SEND_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/sendMessageCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type SendMessageCampaignMutation,
  type SendMessageCampaignMutationVariables,
} from '~/generated-metadata/graphql';

type SendMessageCampaignParams = {
  listId: string;
  messageTopicId?: string;
  subject: string;
  body: string;
  fromAddress: string;
};

export const useSendMessageCampaign = () => {
  const [sendMessageCampaignMutation, { loading }] = useMutation<
    SendMessageCampaignMutation,
    SendMessageCampaignMutationVariables
  >(SEND_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendMessageCampaign = useCallback(
    async (params: SendMessageCampaignParams): Promise<boolean> => {
      try {
        const result = await sendMessageCampaignMutation({
          variables: { input: params },
        });

        const queued = result.data?.sendMessageCampaign;

        if (!queued) {
          enqueueErrorSnackBar({ message: t`Failed to send campaign` });

          return false;
        }

        const { queuedCount, skipped } = queued;
        const skippedCount =
          skipped.noEmail + skipped.deduped + skipped.overCap;

        if (queuedCount === 0) {
          enqueueErrorSnackBar({
            message: t`No recipients to send to (${skippedCount} skipped)`,
          });

          return false;
        }

        enqueueSuccessSnackBar({
          message:
            skippedCount > 0
              ? t`Campaign queued to ${queuedCount} recipient(s), ${skippedCount} skipped`
              : t`Campaign queued to ${queuedCount} recipient(s)`,
        });

        return true;
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error ? error.message : t`Failed to send campaign`,
        });

        return false;
      }
    },
    [sendMessageCampaignMutation, enqueueSuccessSnackBar, enqueueErrorSnackBar],
  );

  return { sendMessageCampaign, loading };
};
