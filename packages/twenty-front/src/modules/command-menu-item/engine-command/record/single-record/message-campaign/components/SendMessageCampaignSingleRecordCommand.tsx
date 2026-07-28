import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

export const SendMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const { sendMessageCampaign } = useSendMessageCampaign();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

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

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
