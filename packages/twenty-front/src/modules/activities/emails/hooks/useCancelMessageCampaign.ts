import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { CANCEL_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/cancelMessageCampaign';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { plural, t } from '@lingui/core/macro';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CancelMessageCampaignMutation,
  type CancelMessageCampaignMutationVariables,
} from '~/generated-metadata/graphql';

export const useCancelMessageCampaign = () => {
  const [cancelMessageCampaignMutation, { loading }] = useMutation<
    CancelMessageCampaignMutation,
    CancelMessageCampaignMutationVariables
  >(CANCEL_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const cancelMessageCampaign = async ({
    campaignId,
    campaignStatus,
  }: {
    campaignId: string;
    campaignStatus: MessageCampaignStatus;
  }): Promise<boolean> => {
    const wasScheduled = campaignStatus === MessageCampaignStatus.SCHEDULED;

    try {
      const result = await cancelMessageCampaignMutation({
        variables: { input: { campaignId } },
      });

      const canceled = result.data?.cancelMessageCampaign;

      if (!isDefined(canceled)) {
        enqueueErrorSnackBar({ message: t`Failed to cancel campaign` });

        return false;
      }

      upsertRecordsInStore({
        partialRecords: [
          {
            __typename: 'MessageCampaign',
            id: campaignId,
            status: wasScheduled
              ? MessageCampaignStatus.DRAFT
              : MessageCampaignStatus.CANCELED,
            scheduledAt: null,
          },
        ],
      });

      if (wasScheduled) {
        enqueueSuccessSnackBar({
          message: t`Campaign unscheduled and back in your drafts`,
        });

        return true;
      }

      enqueueSuccessSnackBar({
        message: plural(canceled.canceledMessageCount, {
          one: `Campaign canceled, ${canceled.canceledMessageCount} pending email stopped`,
          other: `Campaign canceled, ${canceled.canceledMessageCount} pending emails stopped`,
        }),
      });

      return true;
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });

      return false;
    }
  };

  return { cancelMessageCampaign, loading };
};
