import {
  type AppConnection,
  listMessageChannels,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { refreshWhatsappHistoryImportState } from 'src/logic-functions/utils/refresh-whatsapp-history-import-state.util';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export const buildWhatsappSettingsView = async (
  connection: AppConnection | undefined,
): Promise<WhatsappSettingsView> => {
  if (!isDefined(connection)) {
    return { isConnected: false };
  }

  const [settings, historyImport, [channel]] = await Promise.all([
    getWhatsappSettings(connection.id),
    refreshWhatsappHistoryImportState(connection.id),
    listMessageChannels({ connectedAccountId: connection.id }),
  ]);

  return {
    isConnected: true,
    connection: {
      name: connection.name,
      handle: connection.handle,
      isAuthFailed: isDefined(connection.authFailedAt),
    },
    settings: {
      ...settings,
      visibility:
        channel?.visibility === 'SHARE_EVERYTHING'
          ? 'SHARE_EVERYTHING'
          : 'METADATA',
    },
    historyImport,
  };
};
