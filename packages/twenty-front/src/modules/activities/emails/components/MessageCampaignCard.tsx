import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CampaignBodyField } from '@/activities/emails/components/CampaignBodyField';
import { CampaignDetailsFields } from '@/activities/emails/components/CampaignDetailsFields';
import { CampaignSentPreview } from '@/activities/emails/components/CampaignSentPreview';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { type MessageCampaignWidgetSection } from '@/activities/emails/types/MessageCampaignWidgetSection';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type MessageCampaignCardProps = {
  section: MessageCampaignWidgetSection;
};

export const MessageCampaignCard = ({ section }: MessageCampaignCardProps) => {
  const targetRecord = useTargetRecord();

  const { record: campaign, loading: campaignLoading } =
    useFindOneRecord<MessageCampaign>({
      objectNameSingular: CoreObjectNameSingular.MessageCampaign,
      objectRecordId: targetRecord.id,
    });

  const storeStatus = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: targetRecord.id,
    fieldName: 'status',
  }) as string | null;

  if (campaignLoading || !isDefined(campaign)) {
    return null;
  }

  const status = storeStatus ?? campaign.status;
  const isDraft = status === MessageCampaignStatus.DRAFT;

  if (section === 'details') {
    if (!isDraft) {
      return null;
    }

    return <CampaignDetailsFields key={campaign.id} campaign={campaign} />;
  }

  if (!isDraft) {
    return <CampaignSentPreview key={campaign.id} campaign={campaign} />;
  }

  return <CampaignBodyField key={campaign.id} campaign={campaign} />;
};
