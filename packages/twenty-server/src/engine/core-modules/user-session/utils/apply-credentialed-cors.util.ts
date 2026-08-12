import { type INestApplication, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

const logger = new Logger('CredentialedCors');

// Prevents junk Origin headers from growing the warned set unbounded.
const WARNED_ORIGINS_MAX = 1_000;

const toComparableOrigin = (value: string): string | undefined => {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return undefined;
  }
};

// The browser reports a rejected credentialed wildcard response only in its
// own console, leaving nothing server-side for the operator to act on
// (#24037). Warn once per origin on cross-origin browser preflights that will
// be answered with the wildcard.
const warnOnceOnDisallowedBrowserPreflight = ({
  request,
  twentyConfigService,
  warnedOrigins,
}: {
  request: Request;
  twentyConfigService: TwentyConfigService;
  warnedOrigins: Set<string>;
}): void => {
  if (
    request.method !== 'OPTIONS' ||
    !isNonEmptyString(request.headers['access-control-request-method'])
  ) {
    return;
  }

  const origin = request.headers.origin;

  if (!isNonEmptyString(origin)) {
    return;
  }

  const comparableOrigin = toComparableOrigin(origin);

  if (!isNonEmptyString(comparableOrigin)) {
    return;
  }

  // Browsers do not enforce CORS on same-origin requests.
  if (comparableOrigin === toComparableOrigin(getRequestBaseUrl(request))) {
    return;
  }

  if (
    resolveAllowedCredentialedOrigins(twentyConfigService).has(comparableOrigin)
  ) {
    return;
  }

  if (
    warnedOrigins.has(comparableOrigin) ||
    warnedOrigins.size >= WARNED_ORIGINS_MAX
  ) {
    return;
  }

  warnedOrigins.add(comparableOrigin);

  logger.warn(
    `Cross-origin browser request from ${comparableOrigin} (API host: ${getRequestBaseUrl(request)}); credentialed requests from it will be blocked by the browser. If this is your Twenty front-end, serve it same-origin with the API, or add the origin to AUTH_COOKIE_ALLOWED_ORIGINS. Logged once per origin.`,
  );
};

// Shared between the production bootstrap and the integration test harness so
// the CORS behavior under test is the deployed one.
export const applyCredentialedCors = (
  app: INestApplication,
  twentyConfigService: TwentyConfigService,
): void => {
  const warnedOrigins = new Set<string>();

  // The cors package only emits Vary: Origin when it reflects one, so wildcard
  // and reflected responses would share a cache entry and a credentialed
  // request could be served the wildcard, which browsers reject.
  app.use((request: Request, response: Response, next: NextFunction) => {
    response.vary('Origin');
    warnOnceOnDisallowedBrowserPreflight({
      request,
      twentyConfigService,
      warnedOrigins,
    });
    next();
  });

  app.enableCors({
    // Resolved per request rather than once at boot: the origins derive from
    // config the admin panel can change, and a snapshot would drift from the
    // CSRF guard, which resolves them per request and would then disagree with
    // CORS about the same origin.
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean | string) => void,
    ) => {
      if (
        origin &&
        resolveAllowedCredentialedOrigins(twentyConfigService).has(
          origin.toLowerCase(),
        )
      ) {
        return callback(null, true);
      }

      return callback(null, '*');
    },
    credentials: true,
    // Expose WWW-Authenticate so browser-based MCP clients can read the
    // resource_metadata pointer on 401. Required by MCP authorization spec.
    exposedHeaders: ['WWW-Authenticate'],
  });
};
