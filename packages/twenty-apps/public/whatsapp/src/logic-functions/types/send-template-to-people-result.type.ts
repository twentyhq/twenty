export type SendTemplateToPeopleResult =
  | {
      success: true;
      queuedCount: number;
      skippedCount: number;
      skippedCountByReason: Record<'NO_WHATSAPP_NUMBER' | 'MARKETING_OPT_OUT' | 'MISSING_PERSONALIZED_VALUE', number>;
      campaignId?: string;
    }
  | { success: false; error: string };
