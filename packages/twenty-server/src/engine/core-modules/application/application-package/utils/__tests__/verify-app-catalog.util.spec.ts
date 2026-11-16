import { generateKeyPairSync, sign } from 'crypto';

import { verifyAppCatalog } from 'src/engine/core-modules/application/application-package/utils/verify-app-catalog.util';

const NOW = new Date('2026-11-16T00:00:00.000Z');

const buildKeyPair = () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');

  return { privateKey, publicKey: publicKey.export({ format: 'jwk' }).x! };
};

const TRUSTED_KEY_PAIR = buildKeyPair();

const buildSignedCatalog = ({
  sequence = 5,
  expiresAt = '2026-11-20T00:00:00.000Z',
  privateKey = TRUSTED_KEY_PAIR.privateKey,
} = {}) => {
  const payload = JSON.stringify({
    sequence,
    expiresAt,
    apps: [
      {
        package: 'twenty-app-example',
        versions: [{ version: '1.0.0', integrity: 'sha512-abc' }],
        revokedVersions: [],
      },
    ],
  });

  return {
    payload,
    signature: sign(null, Buffer.from(payload), privateKey).toString('base64'),
  };
};

const verify = (signedCatalog: unknown, minimumSequence = 0) =>
  verifyAppCatalog({
    signedCatalog,
    publicKeys: [buildKeyPair().publicKey, TRUSTED_KEY_PAIR.publicKey],
    minimumSequence,
    now: NOW,
  });

describe('verifyAppCatalog', () => {
  it('returns the catalog signed by a trusted key', () => {
    expect(verify(buildSignedCatalog()).apps[0].versions[0].integrity).toBe(
      'sha512-abc',
    );
  });

  it('rejects a catalog signed by an untrusted key', () => {
    expect(() =>
      verify(buildSignedCatalog({ privateKey: buildKeyPair().privateKey })),
    ).toThrow('signature does not match a trusted key');
  });

  it('rejects a payload changed after signing', () => {
    const signedCatalog = buildSignedCatalog();

    expect(() =>
      verify({
        ...signedCatalog,
        payload: signedCatalog.payload.replace('sha512-abc', 'sha512-xyz'),
      }),
    ).toThrow('signature does not match a trusted key');
  });

  it('rejects an expired catalog', () => {
    expect(() =>
      verify(buildSignedCatalog({ expiresAt: '2026-11-15T00:00:00.000Z' })),
    ).toThrow('expired');
  });

  it('rejects a catalog older than the last one applied', () => {
    expect(() => verify(buildSignedCatalog({ sequence: 4 }), 5)).toThrow(
      'sequence 4 is older than 5',
    );
  });

  it('rejects when no key is trusted', () => {
    expect(() =>
      verifyAppCatalog({
        signedCatalog: buildSignedCatalog(),
        publicKeys: [],
        minimumSequence: 0,
        now: NOW,
      }),
    ).toThrow('signature does not match a trusted key');
  });
});
