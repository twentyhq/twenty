import { cancelWhatsappHistoryImport } from 'src/logic-functions/utils/cancel-whatsapp-history-import.util';
import { startWhatsappHistoryImport } from 'src/logic-functions/utils/start-whatsapp-history-import.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';
import { hasWhatsappHistoryToImport } from 'src/utils/has-whatsapp-history-to-import.util';

export const restartWhatsappHistoryImport = async ({
  connectedAccountId,
  settings,
  delayMs,
}: {
  connectedAccountId: string;
  settings: Pick<WhatsappSettings, 'importPolicy' | 'selectedChats'>;
  delayMs?: number;
}): Promise<void> => {
  await cancelWhatsappHistoryImport(connectedAccountId);

  if (!hasWhatsappHistoryToImport(settings)) {
    return;
  }

  await startWhatsappHistoryImport({ connectedAccountId, settings, delayMs });
};
