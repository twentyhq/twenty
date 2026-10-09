import { parseServerRouteSigningKeys } from 'src/engine/core-modules/server-route-trigger/utils/parse-server-route-signing-keys.util';

const RSA_KEY = { kty: 'RSA', kid: 'key-1', n: 'modulus', e: 'AQAB' };

describe('parseServerRouteSigningKeys', () => {
  it('should keep RSA signing keys and their string endorsements', () => {
    expect(
      parseServerRouteSigningKeys({
        keys: [
          { ...RSA_KEY, use: 'sig', endorsements: ['msteams', 'webchat'] },
          { ...RSA_KEY, kid: 'key-2' },
          { ...RSA_KEY, kid: 'key-3', endorsements: [1, 'msteams'] },
        ],
      }),
    ).toEqual([
      { ...RSA_KEY, endorsements: ['msteams', 'webchat'] },
      { ...RSA_KEY, kid: 'key-2', endorsements: undefined },
      { ...RSA_KEY, kid: 'key-3', endorsements: undefined },
    ]);
  });

  it.each([
    ['an encryption key', { ...RSA_KEY, use: 'enc' }],
    ['a non RSA key', { ...RSA_KEY, kty: 'EC' }],
    ['a key without an id', { ...RSA_KEY, kid: '' }],
    ['a key without a modulus', { ...RSA_KEY, n: undefined }],
    ['a key without an exponent', { ...RSA_KEY, e: 42 }],
    ['a key that is not an object', 'not a key'],
  ])('should drop %s', (_, key) => {
    expect(parseServerRouteSigningKeys({ keys: [key, RSA_KEY] })).toEqual([
      { ...RSA_KEY, endorsements: undefined },
    ]);
  });

  it.each([
    ['a non object body', 'keys'],
    ['a body without keys', {}],
    ['a body whose keys are not a list', { keys: RSA_KEY }],
  ])('should return no key for %s', (_, jwksResponseBody) => {
    expect(parseServerRouteSigningKeys(jwksResponseBody)).toEqual([]);
  });
});
