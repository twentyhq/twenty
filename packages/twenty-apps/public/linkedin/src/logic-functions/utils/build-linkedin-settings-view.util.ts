import {
  type AppConnection,
  listMessageChannels,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const buildLinkedinSettingsView = async (
  connection: AppConnection | undefined,
): Promise<LinkedinSettingsView> => {
  if (!isDefined(connection)) {
    return { isConnected: false };
  }

  const [settings, historyImport, [channel]] = await Promise.all([
    getLinkedinSettings(connection.id),
    getLinkedinHistoryImportState(connection.id),
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
      // Only the two levels this app offers; anything else reads as the private one
      visibility:
        channel?.visibility === 'SHARE_EVERYTHING'
          ? 'SHARE_EVERYTHING'
          : 'METADATA',
    },
    historyImport,
  };
};
