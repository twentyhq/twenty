import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { SEND_MESSAGE_CAMPAIGN } from '@/activities/emails/graphql/mutations/sendMessageCampaign';
import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { formatCampaignSendTime } from '@/activities/emails/utils/formatCampaignSendTime';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  type SendMessageCampaignMutation,
  type SendMessageCampaignMutationVariables,
} from '~/generated-metadata/graphql';

type SendMessageCampaignParams = {
  campaignId: string;
  scheduledAt?: string;
  wasAlreadyScheduled?: boolean;
};

export const useSendMessageCampaign = () => {
  const [sendMessageCampaignMutation, { loading }] = useMutation<
    SendMessageCampaignMutation,
    SendMessageCampaignMutationVariables
  >(SEND_MESSAGE_CAMPAIGN);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { formatNumber } = useNumberFormat();
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const sendMessageCampaign = async ({
    campaignId,
    scheduledAt,
    wasAlreadyScheduled = false,
  }: SendMessageCampaignParams): Promise<boolean> => {
    try {
      const result = await sendMessageCampaignMutation({
        variables: { input: { campaignId, scheduledAt } },
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
            status: isNonEmptyString(scheduledAt)
              ? MessageCampaignStatus.SCHEDULED
              : MessageCampaignStatus.SENDING,
            scheduledAt: scheduledAt ?? null,
          },
        ],
      });

      const { queuedCount, audience } = queued;
      const skipReasons = buildExcludedRecipientReasons({
        counts: audience,
        formatNumber,
      }).join(', ');

      if (isNonEmptyString(scheduledAt)) {
        const sendTime = formatCampaignSendTime({
          value: scheduledAt,
          timeZone,
          dateFormat,
          timeFormat,
          localeCatalog,
        });

        enqueueSuccessSnackBar({
          message: wasAlreadyScheduled
            ? t`Campaign moved to ${sendTime}`
            : t`Campaign scheduled for ${sendTime}`,
        });
      } else if (queuedCount === 0) {
        enqueueErrorSnackBar({
          message: t`No recipients to send to (${skipReasons})`,
        });
      } else {
        const queuedMessage = plural(queuedCount, {
          one: `Campaign queued to ${formatNumber(queuedCount)} recipient`,
          other: `Campaign queued to ${formatNumber(queuedCount)} recipients`,
        });

        enqueueSuccessSnackBar({
          message:
            skipReasons.length > 0
              ? t`${queuedMessage}, skipping ${skipReasons}`
              : queuedMessage,
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
