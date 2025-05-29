import { IWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/WhatsappIntegration';

export type FindWhatsappIntegration = Omit<
  IWhatsappIntegration,
  'workspaceId' | 'accessToken'
>;
