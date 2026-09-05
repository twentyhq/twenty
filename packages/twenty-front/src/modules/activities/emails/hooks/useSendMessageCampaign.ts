import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { SEND_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/sendMessageCampaign';
import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { MessageCampaignStatus } from 'twenty-shared/types';
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

const buildSkipReasons = (audience: CampaignAudienceOutcome): string =>
  buildExcludedRecipientReasons(audience).join(', ');

export const useSendMessageCampaign = () => {
  const [sendMessageCampaignMutation, { loading }] = useMutation<
    SendMessageCampaignMutation,
    SendMessageCampaignMutationVariables
  >(SEND_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

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

      // The fetched record only catches up on the next refetch, so the
      // composer would stay editable until then without this.
      upsertRecordsInStore({
        partialRecords: [
          {
            __typename: 'MessageCampaign',
            id: campaignId,
            status: MessageCampaignStatus.SENDING,
          },
        ],
      });

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
