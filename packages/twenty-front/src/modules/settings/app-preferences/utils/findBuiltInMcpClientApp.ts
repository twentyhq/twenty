import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type WellKnownOAuthClient } from '~/generated-metadata/graphql';

export const findBuiltInMcpClientApp = (
  wellKnownOAuthClient: WellKnownOAuthClient | null | undefined,
): BuiltInMcpClientApp | undefined =>
  BUILT_IN_MCP_CLIENT_APPS.find(
    (builtInMcpClientApp) =>
      builtInMcpClientApp.wellKnownOAuthClient === wellKnownOAuthClient,
  );
