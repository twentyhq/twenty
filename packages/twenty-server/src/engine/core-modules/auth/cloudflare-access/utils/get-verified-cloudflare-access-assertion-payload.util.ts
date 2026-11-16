import { type KeyObject } from 'crypto';

import * as jwt from 'jsonwebtoken';
import * as z from 'zod';

const CLOUDFLARE_ACCESS_ASSERTION_PAYLOAD_SCHEMA = z.object({
  email: z.string().optional(),
});

export const getVerifiedCloudflareAccessAssertionPayload = ({
  assertion,
  signingKey,
  issuer,
  audience,
}: {
  assertion: string;
  signingKey: KeyObject;
  issuer: string;
  audience: string;
}): z.infer<typeof CLOUDFLARE_ACCESS_ASSERTION_PAYLOAD_SCHEMA> | undefined => {
  try {
    const payload = jwt.verify(assertion, signingKey, {
      algorithms: ['RS256'],
      issuer,
      audience,
    });

    return CLOUDFLARE_ACCESS_ASSERTION_PAYLOAD_SCHEMA.parse(payload);
  } catch {
    return undefined;
  }
};
