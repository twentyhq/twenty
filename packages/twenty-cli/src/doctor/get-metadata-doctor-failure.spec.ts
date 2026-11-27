import { describe, expect, it } from 'vitest';

import { getMetadataDoctorFailure } from '@/doctor/get-metadata-doctor-failure';
import { toTransportError } from '@/transport/create-target-fetch';

describe('getMetadataDoctorFailure', () => {
  it.each([
    ['CERT_HAS_EXPIRED', 'expired'],
    ['CERT_NOT_YET_VALID', 'not yet valid'],
    ['DEPTH_ZERO_SELF_SIGNED_CERT', 'untrusted self-signed'],
    ['ERR_TLS_CERT_ALTNAME_INVALID', 'does not match its hostname'],
    ['SELF_SIGNED_CERT_IN_CHAIN', 'untrusted self-signed'],
    ['UNABLE_TO_GET_ISSUER_CERT', 'issuer could not be found'],
    ['UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'not trusted locally'],
    ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'could not be verified'],
  ])(
    'explains %s and preserves certificate trust guidance',
    (code, message) => {
      const cause = Object.assign(new Error('private network error details'), {
        code,
      });
      const error = toTransportError({
        error: new TypeError('fetch failed', { cause }),
        signal: new AbortController().signal,
        url: new URL('https://api.example/metadata'),
        timeoutMilliseconds: 30_000,
      });
      const failure = getMetadataDoctorFailure(error);

      expect(failure).toMatchObject({
        id: 'metadata-api',
        status: 'fail',
        code: 'NETWORK_ERROR',
        message: expect.stringContaining(message),
        hint: expect.stringContaining('system trust store'),
        details: { networkCode: code },
      });
      expect(failure.hint).toContain('NODE_EXTRA_CA_CERTS');
      expect(JSON.stringify(failure)).not.toContain(
        'private network error details',
      );
    },
  );
});
