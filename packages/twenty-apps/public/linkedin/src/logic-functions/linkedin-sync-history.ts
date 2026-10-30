import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_SYNC_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinSettingsView } from 'src/logic-functions/utils/build-linkedin-settings-view.util';
import { findOwnLinkedinConnection } from 'src/logic-functions/utils/find-own-linkedin-connection.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { isLinkedinHistoryImportRunning } from 'src/logic-functions/utils/is-linkedin-history-import-running.util';
import { startLinkedinHistoryImport } from 'src/logic-functions/utils/start-linkedin-history-import.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const linkedinSyncHistoryHandler = async (
  _routePayload: RoutePayload,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinSettingsView> => {
  const connection = await findOwnLinkedinConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your LinkedIn account first.');
  }

  // A second click while a run is going would restart it from the first page
  if (
    !isLinkedinHistoryImportRunning(
      await getLinkedinHistoryImportState(connection.id),
    )
  ) {
    const { importPolicy } = await getLinkedinSettings(connection.id);

    await startLinkedinHistoryImport({
      connectedAccountId: connection.id,
      importPolicy,
    });
  }

  return buildLinkedinSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_SYNC_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-sync-history',
  description:
    'Starts importing the past LinkedIn conversations of the requesting member connection again, most recent first.',
  timeoutSeconds: 15,
  handler: linkedinSyncHistoryHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.syncHistory,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
