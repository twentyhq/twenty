import { isNonEmptyString } from '@sniptt/guards';
import { decodeProtectedHeader, importJWK, jwtVerify } from 'jose';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_BOT_CONNECTOR_ISSUER } from 'src/features/chat/logic-functions/constants/teams-bot-connector-issuer';
import { TEAMS_JWT_CLOCK_TOLERANCE_SECONDS } from 'src/features/chat/logic-functions/constants/teams-jwt-clock-tolerance-seconds';
import { type LoadTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/types/load-teams-bot-connector-keys.type';
import { isTeamsEndorsedKey } from 'src/features/chat/logic-functions/utils/is-teams-endorsed-key';
import { normalizeTeamsServiceUrl } from 'src/features/chat/logic-functions/utils/normalize-teams-service-url';
import { resolveTeamsBotConnectorKeyOrThrow } from 'src/features/chat/logic-functions/utils/resolve-teams-bot-connector-key-or-throw';

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

const readKeyId = (token: string): string | null => {
  try {
    const { kid } = decodeProtectedHeader(token);

    return isNonEmptyString(kid) ? kid : null;
  } catch {
    return null;
  }
};

const readServiceUrlClaim = (payload: Record<string, unknown>): string | null =>
  [payload.serviceurl, payload.serviceUrl].find(isNonEmptyString) ?? null;

export const verifyTeamsActivityTokenOrThrow = async ({
  authorizationHeader,
  activityServiceUrl,
  botAppId,
  loadKeys,
}: {
  authorizationHeader: string | undefined;
  activityServiceUrl: string;
  botAppId: string;
  loadKeys?: LoadTeamsBotConnectorKeys;
}): Promise<string> => {
  const token = extractBearerToken(authorizationHeader);

  if (!isDefined(token)) {
    throw new Error(
      'Missing or malformed Authorization header on the Teams activity',
    );
  }

  const keyId = readKeyId(token);

  if (!isDefined(keyId)) {
    throw new Error('Teams activity token names no signing key');
  }

  const signingKey = await resolveTeamsBotConnectorKeyOrThrow({
    keyId,
    loadKeys,
  });

  if (!isTeamsEndorsedKey(signingKey)) {
    throw new Error(
      'Teams activity token is signed with a key not endorsed for Teams',
    );
  }

  const { payload } = await jwtVerify(
    token,
    await importJWK(signingKey, 'RS256'),
    {
      issuer: TEAMS_BOT_CONNECTOR_ISSUER,
      audience: botAppId,
      algorithms: ['RS256'],
      clockTolerance: TEAMS_JWT_CLOCK_TOLERANCE_SECONDS,
    },
  );

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
