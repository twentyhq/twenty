import { type KeyObject } from 'crypto';

import * as jwt from 'jsonwebtoken';
import * as z from 'zod';

import { IDENTITY_ASSERTION_ALGORITHMS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-algorithms.constant';

const IDENTITY_ASSERTION_PAYLOAD_SCHEMA = z.object({
  email: z.string().min(1),
  exp: z.number(),
});

export const verifyIdentityAssertion = ({
  assertion,
  signingKey,
  issuer,
  audience,
}: {
  assertion: string;
  signingKey: KeyObject;
  issuer: string;
  audience: string;
}): { isValid: true; email: string } | { isValid: false; error: string } => {
  try {
    const { email } = IDENTITY_ASSERTION_PAYLOAD_SCHEMA.parse(
      jwt.verify(assertion, signingKey, {
        algorithms: IDENTITY_ASSERTION_ALGORITHMS,
        issuer,
        audience,
      }),
    );

    return { isValid: true, email };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
