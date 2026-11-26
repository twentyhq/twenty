import {
  type AppConnection,
  listMessageChannels,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { refreshLinkedinHistoryImportState } from 'src/logic-functions/utils/refresh-linkedin-history-import-state.util';
import { type LinkedinConnectionSummary } from 'src/types/linkedin-connection-summary.type';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

const toLinkedinConnectionSummary = (
  connection: AppConnection,
): LinkedinConnectionSummary => ({
  id: connection.id,
  name: connection.name,
  handle: connection.handle,
  isAuthFailed: isDefined(connection.authFailedAt),
});

export const buildLinkedinSettingsView = async ({
  connection,
  connections,
}: {
  connection: AppConnection | undefined;
  connections: AppConnection[];
}): Promise<LinkedinSettingsView> => {
  if (!isDefined(connection)) {
    return { isConnected: false };
  }

  const [settings, historyImport, [channel]] = await Promise.all([
    getLinkedinSettings(connection.id),
    refreshLinkedinHistoryImportState(connection.id),
    listMessageChannels({ connectedAccountId: connection.id }),
  ]);

  return {
    isConnected: true,
    connection: toLinkedinConnectionSummary(connection),
    connections: connections.map(toLinkedinConnectionSummary),
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
