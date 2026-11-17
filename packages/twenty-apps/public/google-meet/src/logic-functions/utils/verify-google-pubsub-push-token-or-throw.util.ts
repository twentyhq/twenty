import { isNonEmptyString } from '@sniptt/guards';
import {
  createRemoteJWKSet,
  errors,
  type JWTVerifyGetKey,
  jwtVerify,
} from 'jose';

import {
  GOOGLE_PUBSUB_PUSH_TOKEN_CLOCK_TOLERANCE_SECONDS,
  GOOGLE_SIGNING_KEYS_URL,
  GOOGLE_TOKEN_ISSUERS,
} from 'src/logic-functions/constants/google-pubsub-push.constant';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { extractBearerToken } from 'src/logic-functions/utils/extract-bearer-token.util';

const getGoogleSigningKey = createRemoteJWKSet(
  new URL(GOOGLE_SIGNING_KEYS_URL),
);

export const verifyGooglePubsubPushTokenOrThrow = async ({
  authorizationHeader,
  audience,
  serviceAccountEmail,
  getSigningKey,
}: {
  authorizationHeader: string | undefined;
  audience: string;
  serviceAccountEmail: string;
  getSigningKey?: JWTVerifyGetKey;
}): Promise<void> => {
  const token = extractBearerToken(authorizationHeader);

  if (!isNonEmptyString(token)) {
    throw new GoogleMeetException({
      message: 'The Pub/Sub push request has no bearer token',
      code: 'PUSH_TOKEN_INVALID',
    });
  }

  const { payload } = await jwtVerify(
    token,
    getSigningKey ?? getGoogleSigningKey,
    {
      issuer: GOOGLE_TOKEN_ISSUERS,
      audience,
      algorithms: ['RS256'],
      clockTolerance: GOOGLE_PUBSUB_PUSH_TOKEN_CLOCK_TOLERANCE_SECONDS,
    },
  ).catch((error: unknown) => {
    if (error instanceof errors.JOSEError) {
      throw new GoogleMeetException({
        message: `The Pub/Sub push token is invalid: ${error.message}`,
        code: 'PUSH_TOKEN_INVALID',
      });
    }

    throw error;
  });

  if (
    payload.email !== serviceAccountEmail ||
    payload.email_verified !== true
  ) {
    throw new GoogleMeetException({
      message:
        'The Pub/Sub push token was not issued to the configured service account',
      code: 'PUSH_TOKEN_INVALID',
    });
  }
};
