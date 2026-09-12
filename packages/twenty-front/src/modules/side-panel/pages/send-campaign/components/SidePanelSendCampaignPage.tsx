import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SendCampaignForm } from '@/side-panel/pages/send-campaign/components/SendCampaignForm';
import { sendCampaignCampaignIdComponentState } from '@/side-panel/pages/send-campaign/states/sendCampaignCampaignIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SidePanelSendCampaignPage = () => {
  const sendCampaignCampaignId = useAtomComponentStateValue(
    sendCampaignCampaignIdComponentState,
  );

  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: sendCampaignCampaignId,
  });

  if (!isDefined(campaign)) {
    return null;
  }

  return (
    <SendCampaignForm
      key={`${campaign.id}:${campaign.scheduledAt}`}
      campaign={campaign}
    />
  );
};
