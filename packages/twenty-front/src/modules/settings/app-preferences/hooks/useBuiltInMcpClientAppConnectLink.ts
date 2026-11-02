import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { getBuiltInMcpClientAppConnectLink } from '@/settings/mcp/utils/getBuiltInMcpClientAppConnectLink';
import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useBuiltInMcpClientAppConnectLink = (
  builtInMcpClientApp: Pick<BuiltInMcpClientApp, 'id'>,
) =>
  getBuiltInMcpClientAppConnectLink({
    builtInMcpClientAppId: builtInMcpClientApp.id,
    mcpServerUrl: buildMcpServerUrl(REACT_APP_SERVER_BASE_URL),
  });
