import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCancelMessageCampaign } from '@/activities/emails/hooks/useCancelMessageCampaign';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { t } from '@lingui/core/macro';

export const CancelMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const { cancelMessageCampaign } = useCancelMessageCampaign();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to cancel the campaign');
  }

  const handleExecute = async () => {
    const canceled = await cancelMessageCampaign({ campaignId });

    if (canceled) {
      upsertRecordsInStore({
        partialRecords: [
          {
            __typename: 'MessageCampaign',
            id: campaignId,
            status: MessageCampaignStatus.CANCELED,
          },
        ],
      });
    }
  };

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Cancel Campaign`}
      subtitle={t`Emails already handed to the provider cannot be recalled. This stops everything still waiting to be sent.`}
      confirmButtonText={t`Cancel Campaign`}
      execute={handleExecute}
    />
  );
};
