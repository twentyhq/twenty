import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

// URL.origin drops a default port, so the two spellings of the same origin
// collapse. Returns undefined for anything unparseable, which never matches.
const toComparableOrigin = (value: string): string | undefined => {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return undefined;
  }
};

// Whether a browser at this origin may hold a session cookie for this server:
// the origin the request arrived on, plus the configured credentialed ones.
export const isRequestOriginAllowed = ({
  origin,
  request,
  twentyConfigService,
}: {
  origin: string;
  request: Request;
  twentyConfigService: TwentyConfigService;
}): boolean => {
  const normalizedOrigin = origin.toLowerCase();

  // Same shared helper the discovery controllers use, so the origin this
  // request arrived on is derived one way (and honors `trust proxy`).
  // Compared through URL rather than as strings: browsers omit :443 and :80
  // from Origin while Host keeps whatever port the client spelled out, so a
  // genuine same-origin POST would otherwise 403 on the port alone.
  const comparableOrigin = toComparableOrigin(normalizedOrigin);
  const comparableRequestOrigin = toComparableOrigin(
    getRequestBaseUrl(request),
  );

  if (
    isDefined(comparableOrigin) &&
    comparableOrigin === comparableRequestOrigin
  ) {
    return true;
  }

  return resolveAllowedCredentialedOrigins(twentyConfigService).has(
    normalizedOrigin,
  );
};
