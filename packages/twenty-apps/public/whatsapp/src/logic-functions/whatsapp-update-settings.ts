import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  listMessageChannels,
  type LogicFunctionExecutionContext,
  updateMessageChannel,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_HISTORY_IMPORT_DEBOUNCE_MILLISECONDS } from 'src/constants/whatsapp-history-import-debounce-milliseconds.constant';
import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WHATSAPP_UPDATE_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsappSettingsView } from 'src/logic-functions/utils/build-whatsapp-settings-view.util';
import { findOwnWhatsappConnection } from 'src/logic-functions/utils/find-own-whatsapp-connection.util';
import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { hasWhatsappImportSettingChanged } from 'src/logic-functions/utils/has-whatsapp-import-setting-changed.util';
import { parseWhatsappSettingsUpdate } from 'src/logic-functions/utils/parse-whatsapp-settings-update.util';
import { restartWhatsappHistoryImport } from 'src/logic-functions/utils/restart-whatsapp-history-import.util';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export const whatsappUpdateSettingsHandler = async (
  routePayload: Pick<RoutePayload<Record<string, unknown>>, 'body'>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<WhatsappSettingsView> => {
  const connection = await findOwnWhatsappConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your WhatsApp account first.');
  }

  const { visibility, ...settingsUpdate } = parseWhatsappSettingsUpdate(
    routePayload.body,
  );
  const previousSettings = await getWhatsappSettings(connection.id);
  const settings = { ...previousSettings, ...settingsUpdate };

  await kv.set(
    getWhatsappConnectionKvKey({
      kind: 'settings',
      connectedAccountId: connection.id,
    }),
    settings,
  );

  if (isDefined(visibility)) {
    const [channel] = await listMessageChannels({
      connectedAccountId: connection.id,
    });

    if (isDefined(channel)) {
      await updateMessageChannel({ id: channel.id, visibility });
    }
  }

  if (
    hasWhatsappImportSettingChanged({
      previous: previousSettings,
      next: settings,
    })
  ) {
    await restartWhatsappHistoryImport({
      connectedAccountId: connection.id,
      settings,
      delayMs: WHATSAPP_HISTORY_IMPORT_DEBOUNCE_MILLISECONDS,
    });
  }

  return buildWhatsappSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_UPDATE_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-update-settings',
  description:
    'Saves the WhatsApp sync settings of the requesting member connection.',
  timeoutSeconds: 15,
  handler: whatsappUpdateSettingsHandler,
  httpRouteTriggerSettings: {
    path: WHATSAPP_SETTINGS_ROUTE_PATHS.update,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
