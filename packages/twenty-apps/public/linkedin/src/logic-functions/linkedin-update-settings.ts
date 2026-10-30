import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_UPDATE_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinSettingsView } from 'src/logic-functions/utils/build-linkedin-settings-view.util';
import { findOwnLinkedinConnection } from 'src/logic-functions/utils/find-own-linkedin-connection.util';
import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { isLinkedinImportRangeWider } from 'src/logic-functions/utils/is-linkedin-import-range-wider.util';
import { parseLinkedinSettingsUpdate } from 'src/logic-functions/utils/parse-linkedin-settings-update.util';
import { startLinkedinHistoryImport } from 'src/logic-functions/utils/start-linkedin-history-import.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const linkedinUpdateSettingsHandler = async (
  routePayload: RoutePayload<Record<string, unknown>>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinSettingsView> => {
  const connection = await findOwnLinkedinConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your LinkedIn account first.');
  }

  const settings = {
    ...(await getLinkedinSettings(connection.id)),
    ...parseLinkedinSettingsUpdate(routePayload.body),
  };

  await kv.set(
    getLinkedinConnectionKvKey({
      kind: 'settings',
      connectedAccountId: connection.id,
    }),
    settings,
  );

  const historyImport = await getLinkedinHistoryImportState(connection.id);

  // Messages are imported once, so only a wider range or a failed run has anything left to import
  if (
    !isDefined(historyImport) ||
    historyImport.status === 'FAILED' ||
    isLinkedinImportRangeWider({
      importRange: settings.importRange,
      than: historyImport.importRange,
    })
  ) {
    await startLinkedinHistoryImport({
      connectedAccountId: connection.id,
      importRange: settings.importRange,
    });
  }

  return buildLinkedinSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_UPDATE_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-update-settings',
  description:
    'Saves the LinkedIn sync settings of the requesting member connection and imports more history when the import range grows.',
  timeoutSeconds: 15,
  handler: linkedinUpdateSettingsHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.update,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
