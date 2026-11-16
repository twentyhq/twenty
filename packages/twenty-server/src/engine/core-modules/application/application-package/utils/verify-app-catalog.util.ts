import { createPublicKey, verify } from 'crypto';

import { z } from 'zod';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const signedAppCatalogSchema = z.object({
  payload: z.string(),
  signature: z.string(),
});

const appCatalogSchema = z.object({
  sequence: z.number().int().nonnegative(),
  expiresAt: z.iso.datetime(),
  apps: z.array(
    z.object({
      package: z.string(),
      versions: z.array(
        z.object({ version: z.string(), integrity: z.string() }),
      ),
      revokedVersions: z.array(z.string()),
    }),
  ),
});

export type AppCatalog = z.infer<typeof appCatalogSchema>;

const isSignedByPublicKey = ({
  payload,
  signature,
  publicKey,
}: {
  payload: string;
  signature: string;
  publicKey: string;
}): boolean => {
  try {
    return verify(
      null,
      Buffer.from(payload),
      createPublicKey({
        key: { kty: 'OKP', crv: 'Ed25519', x: publicKey },
        format: 'jwk',
      }),
      Buffer.from(signature, 'base64'),
    );
  } catch {
    return false;
  }
};

const rejectAppCatalog = (reason: string): never => {
  throw new ApplicationException(
    `App catalog rejected: ${reason}`,
    ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
  );
};

export const verifyAppCatalog = ({
  signedCatalog,
  publicKeys,
  now,
}: {
  signedCatalog: unknown;
  publicKeys: string[];
  now: Date;
}): AppCatalog => {
  const parsedSignedCatalog = signedAppCatalogSchema.safeParse(signedCatalog);

  if (!parsedSignedCatalog.success) {
    return rejectAppCatalog('unexpected shape');
  }

  const { payload, signature } = parsedSignedCatalog.data;

  if (
    !publicKeys.some((publicKey) =>
      isSignedByPublicKey({ payload, signature, publicKey }),
    )
  ) {
    return rejectAppCatalog('signature does not match a trusted key');
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(payload);
  } catch {
    return rejectAppCatalog('payload is not JSON');
  }

  const parsedCatalog = appCatalogSchema.safeParse(parsedPayload);

  if (!parsedCatalog.success) {
    return rejectAppCatalog('unexpected payload shape');
  }

  const catalog = parsedCatalog.data;

  if (new Date(catalog.expiresAt) <= now) {
    return rejectAppCatalog(`expired at ${catalog.expiresAt}`);
  }

  return catalog;
};
