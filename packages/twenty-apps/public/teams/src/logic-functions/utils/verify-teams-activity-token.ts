import { isNonEmptyString } from '@sniptt/guards';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_BOT_CONNECTOR_ISSUER } from 'src/logic-functions/constants/teams-bot-connector-issuer';
import { TEAMS_BOT_OPENID_KEYS_URL } from 'src/logic-functions/constants/teams-bot-openid-keys-url';
import { TEAMS_JWT_CLOCK_TOLERANCE_SECONDS } from 'src/logic-functions/constants/teams-jwt-clock-tolerance-seconds';
import { normalizeTeamsServiceUrl } from 'src/logic-functions/utils/normalize-teams-service-url';

const botConnectorKeySet = createRemoteJWKSet(
  new URL(TEAMS_BOT_OPENID_KEYS_URL),
);

const extractBearerToken = (
  authorizationHeader: string | undefined,
): string | null => {
  if (!isNonEmptyString(authorizationHeader)) {
    return null;
  }

  const headerParts = authorizationHeader.trim().split(/\s+/);

  if (headerParts.length !== 2) {
    return null;
  }

  const [scheme, token] = headerParts;

  if (scheme.toLowerCase() !== 'bearer' || !isNonEmptyString(token)) {
    return null;
  }

  return token;
};

const readServiceUrlClaim = (
  payload: Record<string, unknown>,
): string | null => {
  const wireSpellingClaim = payload.serviceurl;
  const documentedSpellingClaim = payload.serviceUrl;

  if (isNonEmptyString(wireSpellingClaim)) {
    return wireSpellingClaim;
  }

  return isNonEmptyString(documentedSpellingClaim)
    ? documentedSpellingClaim
    : null;
};

export const verifyTeamsActivityTokenOrThrow = async ({
  authorizationHeader,
  activityServiceUrl,
  botAppId,
  keySet = botConnectorKeySet,
}: {
  authorizationHeader: string | undefined;
  activityServiceUrl: string;
  botAppId: string;
  keySet?: Parameters<typeof jwtVerify>[1];
}): Promise<string> => {
  const token = extractBearerToken(authorizationHeader);

  if (!isDefined(token)) {
    throw new Error(
      'Missing or malformed Authorization header on the Teams activity',
    );
  }

  const { payload } = await jwtVerify(token, keySet, {
    issuer: TEAMS_BOT_CONNECTOR_ISSUER,
    audience: botAppId,
    algorithms: ['RS256'],
    clockTolerance: TEAMS_JWT_CLOCK_TOLERANCE_SECONDS,
  });

  const serviceUrlClaim = readServiceUrlClaim(payload);

  if (!isDefined(serviceUrlClaim)) {
    throw new Error('Teams activity token has no serviceUrl claim');
  }

  const verifiedServiceUrl = normalizeTeamsServiceUrl(serviceUrlClaim);

  if (verifiedServiceUrl !== normalizeTeamsServiceUrl(activityServiceUrl)) {
    throw new Error(
      'Teams activity serviceUrl does not match the serviceUrl claim',
    );
  }

  return verifiedServiceUrl;
};
