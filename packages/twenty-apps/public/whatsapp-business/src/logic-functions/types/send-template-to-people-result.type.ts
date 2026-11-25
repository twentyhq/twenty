import { type WhatsAppCampaignSkipReason } from 'src/logic-functions/types/whatsapp-campaign-skip-reason.type';

export type SendTemplateToPeopleResult =
  | {
      success: true;
      queuedCount: number;
      skippedCount: number;
      skippedCountByReason: Record<WhatsAppCampaignSkipReason, number>;
      campaignId?: string;
    }
  | { success: false; error: string };
