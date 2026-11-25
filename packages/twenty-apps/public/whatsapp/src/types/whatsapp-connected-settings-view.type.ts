import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export type WhatsappConnectedSettingsView = Extract<
  WhatsappSettingsView,
  { isConnected: true }
>;
