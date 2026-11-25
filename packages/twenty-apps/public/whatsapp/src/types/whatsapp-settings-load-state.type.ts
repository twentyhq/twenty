import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export type WhatsappSettingsLoadState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; view: WhatsappSettingsView };
