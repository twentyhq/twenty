import { isNonEmptyString } from '@sniptt/guards';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';
import { toComparableOrigin } from 'src/engine/core-modules/user-session/utils/to-comparable-origin.util';

// With multi-workspace on, every workspace is served from a subdomain of
// FRONTEND_URL (WorkspaceDomainsService.getTwentyWorkspaceUrl), so the browser
// origin is never the bare FRONTEND_URL. Subdomains are minted at runtime and
// cannot be enumerated in AUTH_COOKIE_ALLOWED_ORIGINS, so they are derived the
// same way DomainServerConfigService.getSubdomainAndDomainFromUrl derives them.
// Scheme and port must match too: https://twenty.com must not vouch for
// http://acme.twenty.com.
const isWorkspaceSubdomainOrigin = (
  origin: string,
  twentyConfigService: TwentyConfigService,
): boolean => {
  if (!twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')) {
    return false;
  }

  const frontendUrl = twentyConfigService.get('FRONTEND_URL');

  if (!isNonEmptyString(frontendUrl)) {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);
    const parsedFrontendUrl = new URL(frontendUrl);

    return (
      parsedOrigin.protocol === parsedFrontendUrl.protocol &&
      parsedOrigin.port === parsedFrontendUrl.port &&
      parsedOrigin.hostname.endsWith(
        `.${parsedFrontendUrl.hostname.toLowerCase()}`,
      )
    );
  } catch {
    return false;
  }
};

export const isOriginAllowedForCredentials = ({
  origin,
  twentyConfigService,
}: {
  origin: string;
  twentyConfigService: TwentyConfigService;
}): boolean => {
  const comparableOrigin = toComparableOrigin(origin);

  if (!isNonEmptyString(comparableOrigin)) {
    return false;
  }

  if (
    resolveAllowedCredentialedOrigins(twentyConfigService).has(comparableOrigin)
  ) {
    return true;
  }

  return isWorkspaceSubdomainOrigin(comparableOrigin, twentyConfigService);
};
