import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_CONNECTION_PROVIDER_NAME } from 'src/constants/line-connection-provider-name.constant';
import { LINE_QUOTA_ROUTE_PATH } from 'src/constants/line-quota-route-path.constant';
import { LINE_LOGIC_FUNCTION_GET_QUOTA_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchLineMessageQuota } from 'src/logic-functions/data/fetch-line-message-quota.util';
import { getLineAccessTokenOrThrow } from 'src/logic-functions/data/get-line-access-token-or-throw.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';
import { type LineQuota } from 'src/logic-functions/types/line-quota.type';

const handler = async (): Promise<LineQuota> => {
  const [connection] = await listConnections({
    providerName: LINE_CONNECTION_PROVIDER_NAME,
  });

  if (!isDefined(connection)) {
    return { status: 'notConnected' };
  }

  const accessToken = await getLineAccessTokenOrThrow(connection.id);
  const { limit, used } = await withConnectionAuthFailureReport(
    connection.id,
    () => fetchLineMessageQuota(accessToken),
  );

  return { status: 'connected', accountName: connection.handle, limit, used };
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_GET_QUOTA_UNIVERSAL_IDENTIFIER,
  name: 'get-quota',
  description:
    "Returns how many messages the Official Account sent this month and its monthly limit, which replies from Twenty count against",
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: LINE_QUOTA_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
