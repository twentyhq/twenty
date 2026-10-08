import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCancelMessageCampaign } from '@/activities/emails/hooks/useCancelMessageCampaign';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { t } from '@lingui/core/macro';

export const CancelMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];
  const campaignId = selectedRecord?.id;
  const { cancelMessageCampaign } = useCancelMessageCampaign();

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to cancel the campaign');
  }

  const campaignStatus: MessageCampaignStatus = selectedRecord.status;
  const isScheduled = campaignStatus === MessageCampaignStatus.SCHEDULED;

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={isScheduled ? t`Unschedule Campaign` : t`Cancel Campaign`}
      subtitle={
        isScheduled
          ? t`Nothing has gone out yet. The campaign returns to your drafts and you can edit or schedule it again.`
          : t`Emails already handed to the provider cannot be recalled. This stops everything still waiting to be sent.`
      }
      confirmButtonText={
        isScheduled ? t`Unschedule Campaign` : t`Cancel Campaign`
      }
      execute={() => cancelMessageCampaign({ campaignId, campaignStatus })}
    />
  );
};
