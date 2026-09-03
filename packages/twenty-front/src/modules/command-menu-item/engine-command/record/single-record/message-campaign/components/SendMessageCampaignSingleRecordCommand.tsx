import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { plural, t } from '@lingui/core/macro';

import { formatNumber } from '~/utils/format/formatNumber';

export const SendMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaign = selectedRecords[0];
  const campaignId = campaign?.id;
  const { sendMessageCampaign } = useSendMessageCampaign();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { audiencePreview, loading: isRecipientCountStillUnknown } =
    useCampaignAudiencePreview({
      listId: campaign?.listId ?? null,
      unsubscribeTopicId: campaign?.unsubscribeTopicId ?? null,
    });

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to send the campaign');
  }

  const handleExecute = async () => {
    const sent = await sendMessageCampaign({ campaignId });

    if (sent) {
      upsertRecordsInStore({
        partialRecords: [
          {
            __typename: 'MessageCampaign',
            id: campaignId,
            status: MessageCampaignStatus.SENDING,
          },
        ],
      });
    }
  };

  const subtitle = isDefined(audiencePreview)
    ? plural(audiencePreview.sendable, {
        one: `This sends to ${formatNumber(audiencePreview.sendable)} recipient and cannot be undone once it starts.`,
        other: `This sends to ${formatNumber(audiencePreview.sendable)} recipients and cannot be undone once it starts.`,
      })
    : t`This sends the campaign to everyone on its list and cannot be undone once it starts.`;

  if (isRecipientCountStillUnknown) {
    return null;
  }

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Send Campaign`}
      subtitle={subtitle}
      confirmButtonText={t`Send Campaign`}
      execute={handleExecute}
    />
  );
};
