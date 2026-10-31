import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { i18n } from '@lingui/core';

// Exact match only: other clients from the same vendors, such as Claude Code, have their own names
export const isBuiltInMcpClientAppName = (appName: string): boolean =>
  BUILT_IN_MCP_CLIENT_APPS.some(
    (builtInMcpClientApp) =>
      i18n._(builtInMcpClientApp.name).toLowerCase() ===
      appName.trim().toLowerCase(),
  );
