import { isNonEmptyString } from '@sniptt/guards';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const toOrigin = (url: string): string | undefined => {
  try {
    return new URL(url).origin.toLowerCase();
  } catch {
    return undefined;
  }
};

// Origins allowed to send credentialed (cookie) cross-origin requests:
// the server itself, the configured frontend, and any explicitly
// allowlisted split-origin deployments.
export const resolveAllowedCredentialedOrigins = (
  twentyConfigService: TwentyConfigService,
): Set<string> => {
  const allowedOrigins = new Set<string>();

  const candidateUrls = [
    twentyConfigService.get('SERVER_URL'),
    twentyConfigService.get('FRONTEND_URL'),
    ...twentyConfigService
      .get('AUTH_COOKIE_ALLOWED_ORIGINS')
      .split(',')
      .map((allowedOrigin) => allowedOrigin.trim()),
  ];

  for (const candidateUrl of candidateUrls) {
    if (!isNonEmptyString(candidateUrl)) {
      continue;
    }

    const origin = toOrigin(candidateUrl);

    if (isNonEmptyString(origin)) {
      allowedOrigins.add(origin);
    }
  }

  return allowedOrigins;
};
