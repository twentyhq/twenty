import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { PAGES_HEALTH_GET_ROUTE_PATH } from 'src/constants/pages-health-route-paths.constant';
import { MESSENGER_LOGIC_FUNCTION_GET_PAGES_HEALTH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { getConnectionPagesHealth } from 'src/logic-functions/data/get-connection-pages-health.util';
import { type GetPagesHealthResult } from 'src/logic-functions/types/page-health.type';

const handler = async (): Promise<GetPagesHealthResult> => {
  const [connections, canEdit] = await Promise.all([
    listConnections({ providerName: 'messenger' }),
    currentUserCanManageApplications(),
  ]);
  const pages = (
    await Promise.all(
      connections.map(({ id }) => getConnectionPagesHealth(id)),
    )
  ).flat();

  return { pages, canEdit };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_GET_PAGES_HEALTH_UNIVERSAL_IDENTIFIER,
  name: 'get-pages-health',
  description:
    'Returns each connected Facebook Page with its webhook subscription and history import state',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: PAGES_HEALTH_GET_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
