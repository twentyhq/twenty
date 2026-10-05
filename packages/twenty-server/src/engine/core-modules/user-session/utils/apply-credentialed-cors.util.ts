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

// Browsers report a rejected credentialed wildcard only in their console (#24037), so warn once per origin.
export const warnOnceOnDisallowedBrowserPreflight = ({
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

// Shared with the integration test harness so the CORS behavior under test is the deployed one.
export const applyCredentialedCors = (
  app: INestApplication,
  twentyConfigService: TwentyConfigService,
): void => {
  const warnedOrigins = new Set<string>();

  // cors only emits Vary: Origin when reflecting, so wildcard and reflected responses would share a cache entry.
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
    // Per request: the admin panel can change the origins, and a boot snapshot would disagree with the CSRF guard.
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
    // Browser-based MCP clients must read the resource_metadata pointer on 401 (MCP authorization spec).
    exposedHeaders: ['WWW-Authenticate'],
  });
};
