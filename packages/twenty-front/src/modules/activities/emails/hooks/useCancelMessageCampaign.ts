import { useMutation } from '@apollo/client/react';

import { CANCEL_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/cancelMessageCampaign';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { plural, t } from '@lingui/core/macro';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import {
  type CancelMessageCampaignMutation,
  type CancelMessageCampaignMutationVariables,
} from '~/generated-metadata/graphql';

export const useCancelMessageCampaign = () => {
  const [cancelMessageCampaignMutation, { loading }] = useMutation<
    CancelMessageCampaignMutation,
    CancelMessageCampaignMutationVariables
  >(CANCEL_MESSAGE_CAMPAIGN);

  const { enqueueToast } = useToast();
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
        enqueueToast({
          variant: 'error',
          children: t`Failed to cancel campaign`,
        });

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
        enqueueToast({
          variant: 'success',
          children: t`Campaign unscheduled and back in your drafts`,
        });

        return true;
      }

      enqueueToast({
        variant: 'success',
        children: plural(canceled.canceledMessageCount, {
          one: `Campaign canceled, ${canceled.canceledMessageCount} pending email stopped`,
          other: `Campaign canceled, ${canceled.canceledMessageCount} pending emails stopped`,
        }),
      });

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { cancelMessageCampaign, loading };
};
