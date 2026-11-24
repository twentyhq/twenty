import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WHATSAPP_GET_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsappSettingsView } from 'src/logic-functions/utils/build-whatsapp-settings-view.util';
import { findOwnWhatsappConnection } from 'src/logic-functions/utils/find-own-whatsapp-connection.util';
import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export const whatsappGetSettingsHandler = async (
  _routePayload: unknown,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<WhatsappSettingsView> =>
  buildWhatsappSettingsView(await findOwnWhatsappConnection(context));

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_GET_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-get-settings',
  description:
    'Returns the WhatsApp sync settings and history import progress of the requesting member connection.',
  timeoutSeconds: 15,
  handler: whatsappGetSettingsHandler,
  httpRouteTriggerSettings: {
    path: WHATSAPP_SETTINGS_ROUTE_PATHS.get,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
