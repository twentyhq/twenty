import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useTargetMessageCampaign = () => {
  const targetRecord = useTargetRecord();

  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: targetRecord.id,
  });

  // Sending optimistically writes the status to the record store, so it turns
  // the campaign read-only before the fetched record catches up.
  const storeStatus = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: targetRecord.id,
    fieldName: 'status',
  }) as MessageCampaignStatus | null;

  // Apollo reports loading whenever the query has a request in flight, even
  // with the record already in hand, so gating on it would unmount the whole
  // composer around every save.
  if (!isDefined(campaign)) {
    return { campaign: undefined, isDraft: false };
  }

  return {
    campaign,
    isDraft: (storeStatus ?? campaign.status) === MessageCampaignStatus.DRAFT,
  };
};
