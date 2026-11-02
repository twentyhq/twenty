import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';

export const isBuiltInMcpClientAppId = (
  applicationId: string | undefined,
): applicationId is BuiltInMcpClientApp['id'] =>
  BUILT_IN_MCP_CLIENT_APPS.some(
    (builtInMcpClientApp) => builtInMcpClientApp.id === applicationId,
  );
