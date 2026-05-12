import {
  createECDH,
  createPrivateKey,
  createPublicKey,
  hkdfSync,
  type KeyObject,
} from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

import {
  type JwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';

const HKDF_HASH = 'sha256';
const HKDF_OUTPUT_BYTES = 32;
const HKDF_INFO = Buffer.from('twenty/jwt/derive/v1', 'utf8');

// HKDF + ECDH-based derivation of a per-tenant ES256 key pair from a master
// ES256 key. The whole point of this util is to give every workspace (and,
// for workspace-agnostic tokens, every user) a cryptographically distinct
// signing/verification key without storing one row per workspace.
//
// Security note: deriving a child PUBLIC key requires the master PRIVATE key
// (no chain-code / BIP32-style trick here), so both the signer and the
// verifier need access to the master private key. In Twenty that's fine —
// both paths run inside the same trust domain — but it is the main reason
// this stays a POC for now.

export type DerivedKeyPair = {
  privateKeyPem: string;
  publicKeyPem: string;
};

export type DerivationScope =
  | { kind: 'workspace'; workspaceId: string }
  | { kind: 'user'; userId: string };

export const extractDerivationScope = (
  payload: JwtPayload,
): DerivationScope | undefined => {
  if (
    payload.type === JwtTokenTypeEnum.WORKSPACE_AGNOSTIC &&
    isNonEmptyString(payload.userId)
  ) {
    return { kind: 'user', userId: payload.userId };
  }

  if ('workspaceId' in payload && isNonEmptyString(payload.workspaceId)) {
    return { kind: 'workspace', workspaceId: payload.workspaceId };
  }

  if ('userId' in payload && isNonEmptyString(payload.userId)) {
    return { kind: 'user', userId: payload.userId };
  }

  return undefined;
};

const derivationScopeToSalt = (scope: DerivationScope): Buffer =>
  Buffer.from(
    scope.kind === 'workspace'
      ? `workspace:${scope.workspaceId}`
      : `user:${scope.userId}`,
    'utf8',
  );

const masterPrivateKeyToIkm = (masterPrivateKeyPem: string): Buffer => {
  const masterKey: KeyObject = createPrivateKey(masterPrivateKeyPem);

  return masterKey.export({ format: 'der', type: 'pkcs8' });
};

const scalarToKeyPair = (scalar: Buffer): DerivedKeyPair => {
  const ecdh = createECDH('prime256v1');

  // setPrivateKey throws if the scalar is 0 or >= n. Probability for a
  // random 32-byte HKDF output is ~2^-128, so in practice this never fires.
  ecdh.setPrivateKey(scalar);

  const uncompressedPub = ecdh.getPublicKey();
  const xBuf = uncompressedPub.subarray(1, 33);
  const yBuf = uncompressedPub.subarray(33, 65);

  const x = xBuf.toString('base64url');
  const y = yBuf.toString('base64url');
  const d = scalar.toString('base64url');

  const privateKey = createPrivateKey({
    key: { kty: 'EC', crv: 'P-256', d, x, y },
    format: 'jwk',
  });
  const publicKey = createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x, y },
    format: 'jwk',
  });

  return {
    privateKeyPem: privateKey
      .export({ format: 'pem', type: 'pkcs8' })
      .toString(),
    publicKeyPem: publicKey.export({ format: 'pem', type: 'spki' }).toString(),
  };
};

export const deriveTenantKeyPair = (
  masterPrivateKeyPem: string,
  scope: DerivationScope,
): DerivedKeyPair => {
  const ikm = masterPrivateKeyToIkm(masterPrivateKeyPem);
  const salt = derivationScopeToSalt(scope);
  const scalar = Buffer.from(
    hkdfSync(HKDF_HASH, ikm, salt, HKDF_INFO, HKDF_OUTPUT_BYTES),
  );

  return scalarToKeyPair(scalar);
};
