import { isNonEmptyString } from '@sniptt/guards';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { TEAMS_BOT_CONNECTOR_ISSUER } from 'src/logic-functions/constants/teams-bot-connector-issuer';
import { TEAMS_BOT_OPENID_KEYS_URL } from 'src/logic-functions/constants/teams-bot-openid-keys-url';
import { TEAMS_JWT_CLOCK_TOLERANCE_SECONDS } from 'src/logic-functions/constants/teams-jwt-clock-tolerance-seconds';
import { type TeamsActivityClaims } from 'src/logic-functions/types/teams-activity-claims.type';
import { normalizeTeamsServiceUrl } from 'src/logic-functions/utils/normalize-teams-service-url';

// Held at module scope so the key set survives warm invocations. jose refetches
// on an unknown key id, which is what keeps a rotated signing key working.
const botConnectorKeySet = createRemoteJWKSet(
  new URL(TEAMS_BOT_OPENID_KEYS_URL),
);

const extractBearerToken = (
  authorizationHeader: string | undefined,
): string | null => {
  if (!isNonEmptyString(authorizationHeader)) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !isNonEmptyString(token)) {
    return null;
  }

  return token;
};

// The Bot Connector emits this claim lowercased while Microsoft's docs spell it
// serviceUrl, so accept either rather than trusting one spelling.
const readServiceUrlClaim = (
  payload: Record<string, unknown>,
): string | null => {
  const claim = payload.serviceurl ?? payload.serviceUrl;

  return typeof claim === 'string' && isNonEmptyString(claim) ? claim : null;
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
}): Promise<TeamsActivityClaims> => {
  const token = extractBearerToken(authorizationHeader);

  if (!isNonEmptyString(token)) {
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

  if (!isNonEmptyString(serviceUrlClaim)) {
    throw new Error('Teams activity token has no serviceUrl claim');
  }

  // Without this the bot would send its own credentials to whatever host the
  // request body names, which is the impersonation path Microsoft warns about.
  if (
    normalizeTeamsServiceUrl(serviceUrlClaim) !==
    normalizeTeamsServiceUrl(activityServiceUrl)
  ) {
    throw new Error(
      'Teams activity serviceUrl does not match the serviceUrl claim',
    );
  }

  return {
    issuer: TEAMS_BOT_CONNECTOR_ISSUER,
    audience: botAppId,
    serviceUrl: normalizeTeamsServiceUrl(serviceUrlClaim),
  };
};
