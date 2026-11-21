import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { PAGE_RESUBSCRIBE_ROUTE_PATH } from 'src/constants/pages-health-route-paths.constant';
import { MESSENGER_LOGIC_FUNCTION_RESUBSCRIBE_PAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { findConnectedAccountIdByPageId } from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { subscribePage } from 'src/logic-functions/data/subscribe-page.util';
import { type SettingsRouteResult } from 'src/logic-functions/types/settings-route-result.type';

const handler = async (
  params: RoutePayload<{ pageId?: unknown }>,
): Promise<SettingsRouteResult> => {
  const pageId = params.body?.pageId;

  if (!isNonEmptyString(pageId)) {
    return { success: false, error: 'pageId must be a string.' };
  }

  if (!(await currentUserCanManageApplications())) {
    return {
      success: false,
      error: 'Only members who can manage applications can resubscribe a Page.',
    };
  }

  const connectedAccountId = await findConnectedAccountIdByPageId(pageId);

  if (!isDefined(connectedAccountId)) {
    return { success: false, error: `Page ${pageId} is not connected.` };
  }

  try {
    await subscribePage({
      pageId,
      pageAccessToken: await getPageAccessTokenOrThrow({
        connectedAccountId,
        pageId,
      }),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_RESUBSCRIBE_PAGE_UNIVERSAL_IDENTIFIER,
  name: 'resubscribe-page',
  description:
    'Subscribes a Facebook Page to the Messenger webhook again, for example after Meta dropped it',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: PAGE_RESUBSCRIBE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
