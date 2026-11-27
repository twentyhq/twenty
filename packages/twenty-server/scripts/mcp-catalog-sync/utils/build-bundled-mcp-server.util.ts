import { isNonEmptyString } from '@sniptt/guards';
import {
  capitalize,
  getLogoUrlFromDomainName,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { type BundledMcpServer } from 'src/engine/core-modules/application/application-bundled/mcp-servers/types/bundled-mcp-server.type';

import { BUNDLED_MCP_SERVER_UNIVERSAL_IDENTIFIER_NAMESPACE } from '../constants/mcp-catalog-sources.constant';
import { type McpConnectorDirectoryEntry } from '../types/mcp-connector-directory-entry.type';
import { type McpRegistryServer } from '../types/mcp-registry-server.type';

const MCP_SERVER_NAME_FORBIDDEN_CHARACTERS = /[^a-z0-9_]/g;
const DESCRIPTION_MAX_LENGTH = 160;
const OTHER_PRODUCT_MENTION = /claude|anthropic|chatgpt|openai/i;

const keepNeutralText = (
  text: string | null | undefined,
): string | undefined =>
  isNonEmptyString(text) && !OTHER_PRODUCT_MENTION.test(text)
    ? text.trim()
    : undefined;

export const buildBundledMcpServer = ({
  registryServer,
  directoryEntry,
}: {
  registryServer: McpRegistryServer;
  directoryEntry: McpConnectorDirectoryEntry | undefined;
}): Omit<BundledMcpServer, 'version'> | undefined => {
  // The registry can declare an API-key header on a server that also signs in with OAuth
  const remote = [
    ...(registryServer.remotes ?? []),
    ...(directoryEntry?.server.remotes ?? []),
  ].find(
    ({ type, url, headers }) =>
      type === 'streamable-http' &&
      !isNonEmptyArray(headers) &&
      !url.includes('{'),
  );

  // Reverse-DNS names: "app.linear/linear" is linear.app, "io.github.PostHog/mcp" the PostHog GitHub org
  const [topLevelDomain, secondLevelDomain, githubOwner] = registryServer.name
    .split('/')[0]
    .split('.');
  const isGithubNamespace =
    topLevelDomain === 'io' && secondLevelDomain === 'github';
  const vendor = isGithubNamespace ? githubOwner : secondLevelDomain;

  if (!isDefined(remote) || !isNonEmptyString(vendor)) {
    return undefined;
  }

  const directory = directoryEntry?._meta['com.anthropic.api/mcp-registry'];
  const label =
    directory?.displayName ?? registryServer.title ?? capitalize(vendor);
  const labelAsName = label
    .toLowerCase()
    .replace(MCP_SERVER_NAME_FORBIDDEN_CHARACTERS, '_');
  const isLabelTheVendorBrand = vendor.toLowerCase().includes(labelAsName);
  const author = isLabelTheVendorBrand ? label : capitalize(vendor);
  // The registry website is often a documentation page, the directory one is the vendor homepage
  const websiteUrl =
    directory?.author?.url ??
    registryServer.websiteUrl ??
    (isGithubNamespace
      ? `https://github.com/${vendor}`
      : `https://${vendor}.${topLevelDomain}`);
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
      BUNDLED_MCP_SERVER_UNIVERSAL_IDENTIFIER_NAMESPACE,
    ),
    name: isLabelTheVendorBrand
      ? labelAsName
      : vendor.toLowerCase().replace(MCP_SERVER_NAME_FORBIDDEN_CHARACTERS, '_'),
    label,
    author,
    description: description.slice(0, DESCRIPTION_MAX_LENGTH),
    aboutDescription:
      keepNeutralText(directoryEntry?.server.description) ?? null,
    websiteUrl,
    logoUrl:
      iconUrl ?? getLogoUrlFromDomainName(new URL(websiteUrl).hostname) ?? null,
    url: remote.url,
  };
};
