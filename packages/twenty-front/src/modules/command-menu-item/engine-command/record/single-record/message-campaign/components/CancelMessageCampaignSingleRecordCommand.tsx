import { isDefined } from 'twenty-shared/utils';

import { useCancelMessageCampaign } from '@/activities/emails/hooks/useCancelMessageCampaign';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { t } from '@lingui/core/macro';

export const CancelMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const { cancelMessageCampaign } = useCancelMessageCampaign();

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to cancel the campaign');
  }

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={t`Cancel Campaign`}
      subtitle={t`Emails already handed to the provider cannot be recalled. This stops everything still waiting to be sent.`}
      confirmButtonText={t`Cancel Campaign`}
      execute={() => cancelMessageCampaign({ campaignId })}
    />
  );
};
