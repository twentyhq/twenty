import { cancelLinkedinHistoryImport } from 'src/logic-functions/utils/cancel-linkedin-history-import.util';
import { startLinkedinHistoryImport } from 'src/logic-functions/utils/start-linkedin-history-import.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { hasLinkedinHistoryToImport } from 'src/utils/has-linkedin-history-to-import.util';

export const restartLinkedinHistoryImport = async ({
  connectedAccountId,
  settings,
  delayMs,
}: {
  connectedAccountId: string;
  settings: Pick<LinkedinSettings, 'importPolicy' | 'selectedChats'>;
  delayMs?: number;
}): Promise<void> => {
  await cancelLinkedinHistoryImport(connectedAccountId);

  if (!hasLinkedinHistoryToImport(settings)) {
    return;
  }

  await startLinkedinHistoryImport({ connectedAccountId, settings, delayMs });
};
