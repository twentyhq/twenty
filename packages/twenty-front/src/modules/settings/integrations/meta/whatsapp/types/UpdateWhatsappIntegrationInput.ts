import { IWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/WhatsappIntegration';

export type UpdateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'disabled' | 'sla'
>;
