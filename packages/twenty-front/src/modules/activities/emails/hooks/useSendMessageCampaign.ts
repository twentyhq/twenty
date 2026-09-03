import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { SEND_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/sendMessageCampaign';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { plural, t } from '@lingui/core/macro';
import {
  type SendMessageCampaignMutation,
  type SendMessageCampaignMutationVariables,
} from '~/generated-metadata/graphql';

type SendMessageCampaignParams = {
  campaignId: string;
};

type CampaignAudienceOutcome = NonNullable<
  SendMessageCampaignMutation['sendMessageCampaign']
>['audience'];

const buildSkipReasons = (audience: CampaignAudienceOutcome): string => {
  const parts: string[] = [];

  if (audience.withoutEmail > 0) {
    parts.push(t`${audience.withoutEmail} without email`);
  }
  if (audience.duplicateEmails > 0) {
    parts.push(
      plural(audience.duplicateEmails, {
        one: `${audience.duplicateEmails} duplicate`,
        other: `${audience.duplicateEmails} duplicates`,
      }),
    );
  }
  if (audience.hardSuppressed > 0) {
    parts.push(t`${audience.hardSuppressed} bounced or complained`);
  }
  if (audience.globallyUnsubscribed > 0) {
    parts.push(
      t`${audience.globallyUnsubscribed} unsubscribed from everything`,
    );
  }
  if (audience.topicUnsubscribed > 0) {
    parts.push(t`${audience.topicUnsubscribed} opted out of this topic`);
  }
  if (audience.overCap > 0) {
    parts.push(t`${audience.overCap} over the recipient limit`);
  }

  return parts.length > 0 ? parts.join(', ') : t`no eligible recipients`;
};

export const useSendMessageCampaign = () => {
  const [sendMessageCampaignMutation, { loading }] = useMutation<
    SendMessageCampaignMutation,
    SendMessageCampaignMutationVariables
  >(SEND_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendMessageCampaign = async ({
    campaignId,
  }: SendMessageCampaignParams): Promise<boolean> => {
    try {
      const result = await sendMessageCampaignMutation({
        variables: { input: { campaignId } },
      });

      const queued = result.data?.sendMessageCampaign;

      if (!queued) {
        enqueueErrorSnackBar({ message: t`Failed to send campaign` });

        return false;
      }

      const { queuedCount, audience } = queued;
      const skippedCount = audience.totalMembers - audience.sendable;
      const skipReasons = buildSkipReasons(audience);

      if (queuedCount === 0) {
        enqueueErrorSnackBar({
          message: t`No recipients to send to (${skipReasons})`,
        });
      } else {
        enqueueSuccessSnackBar({
          message:
            skippedCount > 0
              ? t`Campaign queued to ${queuedCount} recipient(s), ${skippedCount} skipped: ${skipReasons}`
              : t`Campaign queued to ${queuedCount} recipient(s)`,
        });
      }

      return true;
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });

      return false;
    }
  };

  return { sendMessageCampaign, loading };
};
