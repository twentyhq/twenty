import { createPublicKey, type JsonWebKey, type KeyObject } from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import * as z from 'zod';

const SIGNING_KEY_SET_SCHEMA = z.object({ keys: z.array(z.unknown()) });

const SIGNING_KEY_SCHEMA = z.discriminatedUnion('kty', [
  z.object({
    kid: z.string(),
    kty: z.literal('RSA'),
    n: z.string(),
    e: z.string(),
  }),
  z.object({
    kid: z.string(),
    kty: z.literal('EC'),
    crv: z.string(),
    x: z.string(),
    y: z.string(),
  }),
]);

const toPublicKey = (jsonWebKey: JsonWebKey): KeyObject | undefined => {
  try {
    return createPublicKey({ key: jsonWebKey, format: 'jwk' });
  } catch {
    return undefined;
  }
};

// A key the server cannot use is skipped, so one bad entry does not discard the whole set.
export const parseIdentityAssertionSigningKeys = (
  signingKeySet: unknown,
): Map<string, KeyObject> => {
  const { keys } = SIGNING_KEY_SET_SCHEMA.parse(signingKeySet);

  return new Map(
    keys.flatMap((key): [string, KeyObject][] => {
      const signingKey = SIGNING_KEY_SCHEMA.safeParse(key);

      if (!signingKey.success) {
        return [];
      }

      const { kid, ...jsonWebKey } = signingKey.data;
      const publicKey = toPublicKey(jsonWebKey);

      return isDefined(publicKey) ? [[kid, publicKey]] : [];
    }),
  );
};
