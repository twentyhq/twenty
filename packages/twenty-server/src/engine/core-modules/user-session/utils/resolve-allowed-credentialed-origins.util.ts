import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Opaque schemes (file:, data:) serialise to "null", which would allowlist every sandboxed document.
const toOrigin = (url: string): string | undefined => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return undefined;
    }

    return parsedUrl.origin.toLowerCase();
  } catch {
    return undefined;
  }
};

// URL canonicalises [::ffff:127.0.0.1] to hex, so only that spelling reaches here; all of 127.0.0.0/8 is loopback.
const IPV4_LOOPBACK_REGEX = /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV4_MAPPED_HEX_REGEX = /^::ffff:([0-9a-f]{1,4}):[0-9a-f]{1,4}$/;

const isLoopbackHostname = (hostname: string): boolean => {
  // A trailing DNS dot (localhost.) resolves the same but would not match.
  const host = hostname
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase();

  if (host === 'localhost' || host === '::1') {
    return true;
  }

  if (IPV4_LOOPBACK_REGEX.test(host)) {
    return true;
  }

  const mappedHex = IPV4_MAPPED_HEX_REGEX.exec(host);

  // The high byte of the first hextet is the first octet of the v4 address.
  return mappedHex !== null && Number.parseInt(mappedHex[1], 16) >> 8 === 127;
};

const isLoopbackOrigin = (origin: string): boolean => {
  try {
    return isLoopbackHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
};

type AllowedOriginsSettings = {
  serverUrl: string;
  frontendUrl: string;
  authCookieAllowedOrigins: string;
  nodeEnvironment: NodeEnvironment;
};

let cachedAllowedOriginsSettings: AllowedOriginsSettings | undefined;
let cachedComputedAllowedOrigins: ReadonlySet<string> | undefined;

const isSameAllowedOriginsSettings = (
  allowedOriginsSettings: AllowedOriginsSettings,
  otherAllowedOriginsSettings: AllowedOriginsSettings,
): boolean =>
  allowedOriginsSettings.serverUrl === otherAllowedOriginsSettings.serverUrl &&
  allowedOriginsSettings.frontendUrl ===
    otherAllowedOriginsSettings.frontendUrl &&
  allowedOriginsSettings.authCookieAllowedOrigins ===
    otherAllowedOriginsSettings.authCookieAllowedOrigins &&
  allowedOriginsSettings.nodeEnvironment ===
    otherAllowedOriginsSettings.nodeEnvironment;

const computeAllowedCredentialedOrigins = ({
  serverUrl,
  frontendUrl,
  authCookieAllowedOrigins,
  nodeEnvironment,
}: AllowedOriginsSettings): ReadonlySet<string> => {
  const allowedOrigins = new Set<string>();

  const derivedUrls = [serverUrl, frontendUrl];

  const explicitUrls = authCookieAllowedOrigins
    .split(',')
    .map((allowedOrigin) => allowedOrigin.trim());

  // SERVER_URL defaults to http://localhost:3000, which would hand any local page on that port a credentialed origin.
  const isProduction = nodeEnvironment === NodeEnvironment.PRODUCTION;

  for (const candidateUrl of [...derivedUrls, ...explicitUrls]) {
    if (!isNonEmptyString(candidateUrl)) {
      continue;
    }

    const origin = toOrigin(candidateUrl);

    if (!isNonEmptyString(origin)) {
      continue;
    }

    if (
      isProduction &&
      isLoopbackOrigin(origin) &&
      !explicitUrls.includes(candidateUrl)
    ) {
      continue;
    }

    allowedOrigins.add(origin);
  }

  return allowedOrigins;
};

export const resolveAllowedCredentialedOrigins = (
  twentyConfigService: Pick<TwentyConfigService, 'get'>,
): ReadonlySet<string> => {
  const allowedOriginsSettings: AllowedOriginsSettings = {
    serverUrl: twentyConfigService.get('SERVER_URL'),
    frontendUrl: twentyConfigService.get('FRONTEND_URL'),
    authCookieAllowedOrigins: twentyConfigService.get(
      'AUTH_COOKIE_ALLOWED_ORIGINS',
    ),
    nodeEnvironment: twentyConfigService.get('NODE_ENV'),
  };

  if (
    isDefined(cachedAllowedOriginsSettings) &&
    isDefined(cachedComputedAllowedOrigins) &&
    isSameAllowedOriginsSettings(
      cachedAllowedOriginsSettings,
      allowedOriginsSettings,
    )
  ) {
    return cachedComputedAllowedOrigins;
  }

  const allowedOrigins = computeAllowedCredentialedOrigins(
    allowedOriginsSettings,
  );

  cachedAllowedOriginsSettings = allowedOriginsSettings;
  cachedComputedAllowedOrigins = allowedOrigins;

  return allowedOrigins;
};
