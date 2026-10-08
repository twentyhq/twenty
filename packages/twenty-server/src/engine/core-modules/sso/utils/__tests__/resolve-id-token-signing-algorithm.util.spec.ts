/* @license Enterprise */

import { type IssuerMetadata } from 'openid-client';

import { resolveIdTokenSigningAlgorithm } from 'src/engine/core-modules/sso/utils/resolve-id-token-signing-algorithm.util';

const buildIssuerMetadata = (
  idTokenSigningAlgorithms?: unknown,
): IssuerMetadata => ({
  issuer: 'https://idp.example.com',
  ...(idTokenSigningAlgorithms !== undefined && {
    id_token_signing_alg_values_supported: idTokenSigningAlgorithms,
  }),
});

describe('resolveIdTokenSigningAlgorithm', () => {
  it('uses the algorithm the issuer advertises when it does not support RS256', () => {
    expect(resolveIdTokenSigningAlgorithm(buildIssuerMetadata(['ES384']))).toBe(
      'ES384',
    );
  });

  it('prefers RS256 when the issuer supports it', () => {
    expect(
      resolveIdTokenSigningAlgorithm(buildIssuerMetadata(['ES384', 'RS256'])),
    ).toBe('RS256');
  });

  it('never picks unsigned id_tokens', () => {
    expect(
      resolveIdTokenSigningAlgorithm(buildIssuerMetadata(['none', 'ES256'])),
    ).toBe('ES256');
    expect(
      resolveIdTokenSigningAlgorithm(buildIssuerMetadata(['none'])),
    ).toBeUndefined();
  });

  it.each([undefined, 'RS256', [], [42, '']])(
    'leaves the library default when the advertised list is %p',
    (idTokenSigningAlgorithms) => {
      expect(
        resolveIdTokenSigningAlgorithm(
          buildIssuerMetadata(idTokenSigningAlgorithms),
        ),
      ).toBeUndefined();
    },
  );
});
