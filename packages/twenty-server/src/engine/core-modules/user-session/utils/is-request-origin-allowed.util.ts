import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isOriginAllowedForCredentials } from 'src/engine/core-modules/user-session/utils/is-origin-allowed-for-credentials.util';
import { toComparableOrigin } from 'src/engine/core-modules/user-session/utils/to-comparable-origin.util';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

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

  // Compared through URL rather than as strings: browsers omit :443 and :80
  // from Origin while Host keeps whatever port the client spelled, so a genuine
  // same-origin POST would otherwise 403 on the port alone.
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

  return isOriginAllowedForCredentials({
    origin: normalizedOrigin,
    twentyConfigService,
  });
};
