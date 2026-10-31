import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_CANCEL_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinSettingsView } from 'src/logic-functions/utils/build-linkedin-settings-view.util';
import { findOwnLinkedinConnection } from 'src/logic-functions/utils/find-own-linkedin-connection.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { finishLinkedinHistoryImport } from 'src/logic-functions/utils/refresh-linkedin-history-import-state.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const linkedinCancelHistoryImportHandler = async (
  _routePayload: RoutePayload,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinSettingsView> => {
  const connection = await findOwnLinkedinConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your LinkedIn account first.');
  }

  const state = await getLinkedinHistoryImportState(connection.id);

  if (state?.status === 'IMPORTING') {
    await finishLinkedinHistoryImport({
      connectedAccountId: connection.id,
      state: {
        ...state,
        status: 'CANCELLED',
        finishedAt: new Date().toISOString(),
      },
    });
  }

  return buildLinkedinSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_CANCEL_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-cancel-history-import',
  description:
    'Cancels the running LinkedIn history import of the requesting member connection; its queued jobs then skip their chunk.',
  timeoutSeconds: 15,
  handler: linkedinCancelHistoryImportHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.cancelHistoryImport,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
