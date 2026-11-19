import { isNonEmptyString } from '@sniptt/guards';
import {
  capitalize,
  getLogoUrlFromDomainName,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';

import { MARKETPLACE_MCP_SERVER_UNIVERSAL_IDENTIFIER_NAMESPACE } from '../constants/mcp-catalog-sources.constant';
import { type McpConnectorDirectoryEntry } from '../types/mcp-connector-directory-entry.type';
import { type McpRegistryServer } from '../types/mcp-registry-server.type';

const MCP_SERVER_NAME_FORBIDDEN_CHARACTERS = /[^a-z0-9_]/g;
const DESCRIPTION_MAX_LENGTH = 160;
const OTHER_PRODUCT_MENTION = /claude|anthropic|chatgpt|openai/i;

const keepNeutralText = (text: string | undefined): string | undefined =>
  isNonEmptyString(text) && !OTHER_PRODUCT_MENTION.test(text)
    ? text.trim()
    : undefined;

const toIsReadOnly = (permissions: string | null | undefined) => {
  if (!isNonEmptyString(permissions)) {
    return null;
  }

  return !/write/i.test(permissions);
};

export const buildMarketplaceMcpServer = ({
  registryServer,
  directoryEntry,
}: {
  registryServer: McpRegistryServer;
  directoryEntry: McpConnectorDirectoryEntry | undefined;
}): MarketplaceMcpServer | undefined => {
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

  const directory = directoryEntry?._meta['com.anthropic.api/mcp-registry'];
  const author = capitalize(vendor);
  const websiteUrl =
    registryServer.websiteUrl ??
    directory?.author?.url ??
    `https://${vendor}.${topLevelDomain}`;
  const iconUrl = (
    registryServer.icons?.find(({ mimeType }) => mimeType === 'image/png') ??
    registryServer.icons?.[0]
  )?.src;
  const description =
    keepNeutralText(directory?.oneLiner) ??
    keepNeutralText(registryServer.description) ??
    '';

  return {
    registryName: registryServer.name,
    universalIdentifier: v5(
      registryServer.name,
      MARKETPLACE_MCP_SERVER_UNIVERSAL_IDENTIFIER_NAMESPACE,
    ),
    name: vendor
      .toLowerCase()
      .replace(MCP_SERVER_NAME_FORBIDDEN_CHARACTERS, '_'),
    label: registryServer.title ?? directory?.displayName ?? author,
    author,
    description: description.slice(0, DESCRIPTION_MAX_LENGTH),
    aboutDescription:
      keepNeutralText(directoryEntry?.server.description) ?? null,
    websiteUrl,
    logoUrl:
      iconUrl ?? getLogoUrlFromDomainName(new URL(websiteUrl).hostname) ?? null,
    url: remote.url,
    toolNames: directory?.toolNames ?? [],
    isReadOnly: toIsReadOnly(directory?.permissions),
  };
};
