import { type CampaignDeliveryTiming } from '@/activities/emails/types/CampaignDeliveryTiming';

export type CampaignDelivery = {
  timing: CampaignDeliveryTiming;
  scheduledAt: string | null;
};
