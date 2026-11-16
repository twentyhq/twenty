import { type KeyObject } from 'crypto';

import * as jwt from 'jsonwebtoken';
import * as z from 'zod';

const CLOUDFLARE_ACCESS_ASSERTION_PAYLOAD_SCHEMA = z.object({
  email: z.string().optional(),
});

export const verifyCloudflareAccessAssertion = ({
  assertion,
  signingKey,
  issuer,
  audience,
}: {
  assertion: string;
  signingKey: KeyObject;
  issuer: string;
  audience: string;
}):
  | { isValid: true; email: string | undefined }
  | { isValid: false; error: string } => {
  try {
    const { email } = CLOUDFLARE_ACCESS_ASSERTION_PAYLOAD_SCHEMA.parse(
      jwt.verify(assertion, signingKey, {
        algorithms: ['RS256'],
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
