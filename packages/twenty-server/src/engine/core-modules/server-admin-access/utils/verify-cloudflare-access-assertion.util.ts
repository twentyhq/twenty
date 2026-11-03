import { Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type JWTVerifyGetKey, jwtVerify } from 'jose';

const logger = new Logger('CloudflareAccessAssertion');

export const verifyCloudflareAccessAssertion = async ({
  assertion,
  teamDomain,
  audience,
  keySet,
}: {
  assertion: string | undefined;
  teamDomain: string;
  audience: string;
  keySet: JWTVerifyGetKey;
}): Promise<string | undefined> => {
  if (!isNonEmptyString(assertion)) {
    return undefined;
  }

  try {
    const { payload } = await jwtVerify(assertion, keySet, {
      algorithms: ['RS256'],
      issuer: teamDomain,
      audience,
      requiredClaims: ['exp', 'email'],
    });

    return isNonEmptyString(payload.email)
      ? payload.email.toLowerCase()
      : undefined;
  } catch (error) {
    logger.warn(
      `Cloudflare Access assertion rejected: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
