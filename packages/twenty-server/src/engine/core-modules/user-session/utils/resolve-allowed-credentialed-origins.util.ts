import { isNonEmptyString } from '@sniptt/guards';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Opaque schemes (file:, data:) serialise to the literal "null" origin, which
// would otherwise allowlist every sandboxed document that sends Origin: null.
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

// URL canonicalises [::ffff:127.0.0.1] to [::ffff:7f00:1], so matching the
// dotted spelling alone would miss it. The whole 127.0.0.0/8 block is
// loopback, not just 127.0.0.1.
const IPV4_LOOPBACK_REGEX = /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV4_MAPPED_DOTTED_REGEX = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/;
const IPV4_MAPPED_HEX_REGEX = /^::ffff:([0-9a-f]{1,4}):[0-9a-f]{1,4}$/;

const isLoopbackHostname = (hostname: string): boolean => {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (host === 'localhost' || host === '::1') {
    return true;
  }

  if (IPV4_LOOPBACK_REGEX.test(host)) {
    return true;
  }

  const mappedDotted = IPV4_MAPPED_DOTTED_REGEX.exec(host);

  if (mappedDotted !== null) {
    return IPV4_LOOPBACK_REGEX.test(mappedDotted[1]);
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

// Origins allowed to send credentialed (cookie) cross-origin requests:
// the server itself, the configured frontend, and any explicitly
// allowlisted split-origin deployments.
export const resolveAllowedCredentialedOrigins = (
  twentyConfigService: TwentyConfigService,
): Set<string> => {
  const allowedOrigins = new Set<string>();

  const derivedUrls = [
    twentyConfigService.get('SERVER_URL'),
    twentyConfigService.get('FRONTEND_URL'),
  ];

  const explicitUrls = twentyConfigService
    .get('AUTH_COOKIE_ALLOWED_ORIGINS')
    .split(',')
    .map((allowedOrigin) => allowedOrigin.trim());

  // SERVER_URL defaults to http://localhost:3000, so a deployment that never
  // set it would hand any local page on that port a credentialed origin.
  // Explicit entries are still honoured, which keeps local development and
  // split-origin dev setups working.
  const isProduction =
    twentyConfigService.get('NODE_ENV') === NodeEnvironment.PRODUCTION;

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
