import { describe, expect, it } from 'vitest';

import { toTransportError } from '@/transport/create-target-fetch';

const convertError = (error: unknown) =>
  toTransportError({
    error,
    signal: new AbortController().signal,
    url: new URL('https://api.example/metadata'),
    timeoutMilliseconds: 30_000,
  });

describe('toTransportError', () => {
  it.each([
    'SELF_SIGNED_CERT_IN_CHAIN',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'CERT_HAS_EXPIRED',
    'CERT_NOT_YET_VALID',
    'UNABLE_TO_GET_ISSUER_CERT',
    'ERR_TLS_CERT_ALTNAME_INVALID',
  ])('identifies %s without reporting the server as down', (code) => {
    const cause = Object.assign(new Error('certificate verification failed'), {
      code,
    });
    const error = convertError(new TypeError('fetch failed', { cause }));

    expect(error).toMatchObject({
      code: 'NETWORK_ERROR',
      message: `Could not verify the TLS certificate for https://api.example (${code}).`,
      hint: expect.stringContaining('system trust store'),
      details: { networkCode: code },
    });
  });

  it('keeps ordinary connection failures distinct', () => {
    const cause = Object.assign(new Error('connect ECONNREFUSED'), {
      code: 'ECONNREFUSED',
    });

    expect(
      convertError(new TypeError('fetch failed', { cause })),
    ).toMatchObject({
      message: 'Could not reach https://api.example.',
      details: { networkCode: 'ECONNREFUSED' },
    });
  });
});
