export type WhatsAppAccountHealth = {
  whatsAppBusinessAccountId: string;
  name: string;
  phoneNumbers: Array<{
    displayPhoneNumber: string;
    verifiedName: string;
    qualityRating: string;
    messagingLimitTier: string | null;
    status: string | null;
    nameStatus: string | null;
  }>;
  last30Days:
    | { sentCount: number; deliveredCount: number; cost: number; currency: string | null }
    | { error: string };
};
