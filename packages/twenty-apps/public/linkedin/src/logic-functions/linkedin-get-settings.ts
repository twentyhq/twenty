import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_GET_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinSettingsView } from 'src/logic-functions/utils/build-linkedin-settings-view.util';
import { findOwnLinkedinConnection } from 'src/logic-functions/utils/find-own-linkedin-connection.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const linkedinGetSettingsHandler = async (
  _routePayload: RoutePayload,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinSettingsView> =>
  buildLinkedinSettingsView(await findOwnLinkedinConnection(context));

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_GET_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-get-settings',
  description:
    'Returns the LinkedIn sync settings and history import progress of the requesting member connection.',
  timeoutSeconds: 15,
  handler: linkedinGetSettingsHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.get,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
