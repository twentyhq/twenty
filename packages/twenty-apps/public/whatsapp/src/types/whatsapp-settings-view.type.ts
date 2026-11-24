import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';
import { type WhatsappVisibility } from 'src/types/whatsapp-visibility.type';

export type WhatsappSettingsView =
  | { isConnected: false }
  | {
      isConnected: true;
      connection: { name: string; handle: string; isAuthFailed: boolean };
      settings: WhatsappSettings & { visibility: WhatsappVisibility };
      historyImport: WhatsappHistoryImportState | null;
    };
