import { IWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/WhatsappIntegration';

export type CreateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'id' | 'workspaceId' | 'disabled' | 'workspace' | 'sla'
>;
