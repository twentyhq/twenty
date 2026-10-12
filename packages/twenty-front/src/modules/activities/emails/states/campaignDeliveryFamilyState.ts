import { type CampaignDelivery } from '@/activities/emails/types/CampaignDelivery';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const campaignDeliveryFamilyState = createAtomFamilyState<
  CampaignDelivery,
  string
>({
  key: 'campaignDeliveryFamilyState',
  defaultValue: { timing: 'NOW', scheduledAt: null },
});
