import { AxiosError, type AxiosResponse } from 'axios';

import { SsrfBlockedException } from 'src/engine/core-modules/secure-http-client/exceptions/ssrf-blocked.exception';
import { classifyHttpEgressError } from 'src/engine/core-modules/http-egress/utils/classify-http-egress-error.util';

const buildAxiosError = ({
  message = 'failed',
  code,
  response,
}: {
  message?: string;
  code?: string;
  response?: Partial<AxiosResponse>;
}) =>
  new AxiosError(
    message,
    code,
    undefined,
    undefined,
    response as AxiosResponse | undefined,
  );

describe('classifyHttpEgressError', () => {
  it('should classify an SSRF guard block thrown directly', () => {
    expect(
      classifyHttpEgressError(new SsrfBlockedException('blocked', '10.0.0.1')),
    ).toEqual({ outcome: 'blocked', resolvedAddress: '10.0.0.1' });
  });

  it('should find an SSRF guard block wrapped by a redirect and by axios', () => {
    const redirectError = Object.assign(
      new Error('Redirected request failed: blocked'),
      { cause: new SsrfBlockedException('blocked', '169.254.169.254') },
    );

    expect(classifyHttpEgressError(AxiosError.from(redirectError))).toEqual({
      outcome: 'blocked',
      resolvedAddress: '169.254.169.254',
    });
  });

  it('should classify a response with an error status', () => {
    expect(
      classifyHttpEgressError(buildAxiosError({ response: { status: 503 } })),
    ).toMatchObject({ outcome: 'http_error', status: 503 });
  });

  it.each(['ERR_CANCELED', 'ECONNABORTED', 'ETIMEDOUT'])(
    'should classify %s as a timeout',
    (code) => {
      expect(classifyHttpEgressError(buildAxiosError({ code }))).toEqual({
        outcome: 'timeout',
      });
    },
  );

  it.each([
    [{ message: 'maxContentLength size of 1024 exceeded' }],
    [{ message: 'Request body larger than maxBodyLength limit' }],
    [{ code: 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED' }],
  ])('should classify %o as a payload too large', (properties) => {
    expect(classifyHttpEgressError(buildAxiosError(properties))).toEqual({
      outcome: 'payload_too_large',
    });
  });

  it('should classify other axios errors as network errors', () => {
    expect(
      classifyHttpEgressError(buildAxiosError({ code: 'ECONNREFUSED' })),
    ).toEqual({ outcome: 'network_error' });
  });

  it('should classify errors raised before the request as invalid requests', () => {
    expect(
      classifyHttpEgressError(
        new Error('String data for FormData must be valid JSON'),
      ),
    ).toEqual({ outcome: 'invalid_request' });
  });
});
