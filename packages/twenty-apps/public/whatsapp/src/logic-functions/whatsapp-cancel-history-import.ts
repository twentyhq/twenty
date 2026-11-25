import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WHATSAPP_CANCEL_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsappSettingsView } from 'src/logic-functions/utils/build-whatsapp-settings-view.util';
import { findOwnWhatsappConnection } from 'src/logic-functions/utils/find-own-whatsapp-connection.util';
import { cancelWhatsappHistoryImport } from 'src/logic-functions/utils/cancel-whatsapp-history-import.util';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export const whatsappCancelHistoryImportHandler = async (
  _routePayload: unknown,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<WhatsappSettingsView> => {
  const connection = await findOwnWhatsappConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your WhatsApp account first.');
  }

  await cancelWhatsappHistoryImport(connection.id);

  return buildWhatsappSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_CANCEL_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-cancel-history-import',
  description:
    'Cancels the running WhatsApp history import of the requesting member connection; its queued jobs then skip their chunk.',
  timeoutSeconds: 15,
  handler: whatsappCancelHistoryImportHandler,
  httpRouteTriggerSettings: {
    path: WHATSAPP_SETTINGS_ROUTE_PATHS.cancelHistoryImport,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
