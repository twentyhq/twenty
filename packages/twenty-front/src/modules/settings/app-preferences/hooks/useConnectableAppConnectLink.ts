import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { getConnectableAppConnectLink } from '@/settings/app-preferences/utils/getConnectableAppConnectLink';
import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useConnectableAppConnectLink = (
  connectableApp: Pick<ConnectableApp, 'connectUrl'>,
) =>
  getConnectableAppConnectLink({
    connectUrl: connectableApp.connectUrl,
    mcpServerUrl: buildMcpServerUrl(REACT_APP_SERVER_BASE_URL),
  });
