import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_SYNC_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinSettingsView } from 'src/logic-functions/utils/build-linkedin-settings-view.util';
import { findOwnLinkedinConnections } from 'src/logic-functions/utils/find-own-linkedin-connections.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { refreshLinkedinHistoryImportState } from 'src/logic-functions/utils/refresh-linkedin-history-import-state.util';
import { startLinkedinHistoryImport } from 'src/logic-functions/utils/start-linkedin-history-import.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';
import { hasLinkedinHistoryToImport } from 'src/utils/has-linkedin-history-to-import.util';

export const linkedinSyncHistoryHandler = async (
  routePayload: Pick<RoutePayload<Record<string, unknown>>, 'body'>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinSettingsView> => {
  const { connections, requestedConnection: connection } =
    await findOwnLinkedinConnections(context, routePayload.body);

  if (!isDefined(connection)) {
    throw new Error('Connect your LinkedIn account first.');
  }

  const historyImport = await refreshLinkedinHistoryImportState(connection.id);

  if (historyImport?.status !== 'IMPORTING') {
    const settings = await getLinkedinSettings(connection.id);

    if (hasLinkedinHistoryToImport(settings)) {
      await startLinkedinHistoryImport({
        connectedAccountId: connection.id,
        settings,
      });
    }
  }

  return buildLinkedinSettingsView({ connection, connections });
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_SYNC_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-sync-history',
  description:
    'Retries the LinkedIn history import of one of the requesting member connections.',
  timeoutSeconds: 15,
  handler: linkedinSyncHistoryHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.syncHistory,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
