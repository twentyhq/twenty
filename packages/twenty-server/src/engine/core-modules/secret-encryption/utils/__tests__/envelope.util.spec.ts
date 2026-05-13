import {
  ENVELOPE_V1_PREFIX,
  ENVELOPE_V2_PREFIX,
  formatV2Envelope,
  parseEnvelope,
} from 'src/engine/core-modules/secret-encryption/utils/envelope.util';

describe('parseEnvelope', () => {
  it('returns version: null for an unprefixed value', () => {
    expect(parseEnvelope('opaque-base64-string')).toEqual({ version: null });
  });

  it('returns version: null for the empty string', () => {
    expect(parseEnvelope('')).toEqual({ version: null });
  });

  it('parses a v1 envelope and exposes the payload', () => {
    expect(parseEnvelope(`${ENVELOPE_V1_PREFIX}payloadbase64`)).toEqual({
      version: 1,
      payload: 'payloadbase64',
    });
  });

  it('parses a v2 envelope, splitting keyId and payload', () => {
    expect(
      parseEnvelope(`${ENVELOPE_V2_PREFIX}deadbeef:cipherpayload`),
    ).toEqual({ version: 2, keyId: 'deadbeef', payload: 'cipherpayload' });
  });

  it('throws on a v2 envelope missing the keyId separator', () => {
    expect(() => parseEnvelope(`${ENVELOPE_V2_PREFIX}no-separator`)).toThrow(
      /Malformed enc:v2 envelope/,
    );
  });

  it('throws on a v2 envelope with an empty keyId (leading colon)', () => {
    expect(() => parseEnvelope(`${ENVELOPE_V2_PREFIX}:payload`)).toThrow(
      /Malformed enc:v2 envelope/,
    );
  });

  it('throws on an unknown envelope version', () => {
    expect(() => parseEnvelope('enc:v99:whatever')).toThrow(
      /Unknown ciphertext envelope version/,
    );
  });
});

describe('formatV2Envelope', () => {
  it('concatenates the v2 prefix, keyId, and payload', () => {
    expect(formatV2Envelope('abcd1234', 'payload')).toBe(
      `${ENVELOPE_V2_PREFIX}abcd1234:payload`,
    );
  });

  it('round-trips with parseEnvelope', () => {
    const envelope = formatV2Envelope('deadbeef', 'cipherpayload');
    const parsed = parseEnvelope(envelope);

    expect(parsed).toEqual({
      version: 2,
      keyId: 'deadbeef',
      payload: 'cipherpayload',
    });
  });
});
