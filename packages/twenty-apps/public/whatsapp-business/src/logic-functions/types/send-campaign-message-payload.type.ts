import { type WhatsAppCampaignContent } from 'src/logic-functions/types/whatsapp-campaign-content.type';

export type SendCampaignMessagePayload = WhatsAppCampaignContent & {
  campaignId: string;
  personId: string;
};
