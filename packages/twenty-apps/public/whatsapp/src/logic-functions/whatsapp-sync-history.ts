import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WHATSAPP_SYNC_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsappSettingsView } from 'src/logic-functions/utils/build-whatsapp-settings-view.util';
import { findOwnWhatsappConnection } from 'src/logic-functions/utils/find-own-whatsapp-connection.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { refreshWhatsappHistoryImportState } from 'src/logic-functions/utils/refresh-whatsapp-history-import-state.util';
import { startWhatsappHistoryImport } from 'src/logic-functions/utils/start-whatsapp-history-import.util';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';
import { hasWhatsappHistoryToImport } from 'src/utils/has-whatsapp-history-to-import.util';

export const whatsappSyncHistoryHandler = async (
  _routePayload: unknown,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<WhatsappSettingsView> => {
  const connection = await findOwnWhatsappConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your WhatsApp account first.');
  }

  const historyImport = await refreshWhatsappHistoryImportState(connection.id);

  if (historyImport?.status !== 'IMPORTING') {
    const settings = await getWhatsappSettings(connection.id);

    if (hasWhatsappHistoryToImport(settings)) {
      await startWhatsappHistoryImport({
        connectedAccountId: connection.id,
        settings,
      });
    }
  }

  return buildWhatsappSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_SYNC_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-sync-history',
  description:
    'Retries the WhatsApp history import of the requesting member connection.',
  timeoutSeconds: 15,
  handler: whatsappSyncHistoryHandler,
  httpRouteTriggerSettings: {
    path: WHATSAPP_SETTINGS_ROUTE_PATHS.syncHistory,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
