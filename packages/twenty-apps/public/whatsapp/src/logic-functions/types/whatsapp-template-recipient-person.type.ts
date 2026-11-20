export type WhatsAppTemplateRecipientPerson = {
  id: string;
  whatsAppId: string | null;
  whatsAppUserId: string | null;
  whatsAppMarketingOptOut: boolean | null;
  phones: { primaryPhoneNumber: string | null; primaryPhoneCallingCode: string | null } | null;
};
