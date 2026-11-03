import { isNonEmptyString } from '@sniptt/guards';
import { type JWTVerifyGetKey, jwtVerify } from 'jose';

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
  } catch {
    return undefined;
  }
};
