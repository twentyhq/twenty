import { isNonEmptyString } from '@sniptt/guards';
import {
  capitalize,
  getLogoUrlFromDomainName,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { MARKETPLACE_MCP_SERVER_UNIVERSAL_IDENTIFIER_NAMESPACE } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/constants/mcp-registry.constant';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';
import { type McpRegistryServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/mcp-registry-server.type';

const MCP_SERVER_NAME_FORBIDDEN_CHARACTERS = /[^a-z0-9_]/g;

export const fromMcpRegistryServerToMarketplaceMcpServer = (
  registryServer: McpRegistryServer,
): MarketplaceMcpServer | undefined => {
  // A remote that needs headers or URL variables cannot be added in one click
  const remote = registryServer.remotes?.find(
    ({ type, url, headers }) =>
      type === 'streamable-http' &&
      !isNonEmptyArray(headers) &&
      !url.includes('{'),
  );

  // Registry names are reverse-DNS: "app.linear/linear" is owned by linear.app
  const [topLevelDomain, vendor] = registryServer.name.split('/')[0].split('.');

  if (!isDefined(remote) || !isNonEmptyString(vendor)) {
    return undefined;
  }

  const author = capitalize(vendor);
  const websiteUrl =
    registryServer.websiteUrl ?? `https://${vendor}.${topLevelDomain}`;
  const iconUrl = (
    registryServer.icons?.find(({ mimeType }) => mimeType === 'image/png') ??
    registryServer.icons?.[0]
  )?.src;

  return {
    universalIdentifier: v5(
      registryServer.name,
      MARKETPLACE_MCP_SERVER_UNIVERSAL_IDENTIFIER_NAMESPACE,
    ),
    name: vendor
      .toLowerCase()
      .replace(MCP_SERVER_NAME_FORBIDDEN_CHARACTERS, '_'),
    label: registryServer.title ?? author,
    author,
    description: registryServer.description ?? '',
    websiteUrl,
    logoUrl: iconUrl ?? getLogoUrlFromDomainName(new URL(websiteUrl).hostname),
    url: remote.url,
  };
};
