import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CampaignComposer } from '@/activities/emails/components/CampaignComposer';
import { MessageCampaignStats } from '@/activities/emails/components/MessageCampaignStats';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

export const MessageCampaignCard = () => {
  const targetRecord = useTargetRecord();

  const {
    record: campaign,
    loading: campaignLoading,
    refetch: refetchCampaign,
  } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: targetRecord.id,
  });

  if (campaignLoading || !isDefined(campaign)) {
    return null;
  }

  if (campaign.status !== MessageCampaignStatus.DRAFT) {
    return (
      <MessageCampaignStats
        status={campaign.status}
        subject={campaign.subject}
        sentAt={campaign.sentAt}
        sentCount={campaign.sentCount}
        failedCount={campaign.failedCount}
        bouncedCount={campaign.bouncedCount}
        complainedCount={campaign.complainedCount}
      />
    );
  }

  return (
    <CampaignComposer
      key={campaign.id}
      campaign={campaign}
      onSent={() => refetchCampaign()}
    />
  );
};
