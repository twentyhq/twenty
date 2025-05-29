import { IWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/WhatsappIntegration';

export type CreateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'id' | 'disabled' | 'sla'
>;
