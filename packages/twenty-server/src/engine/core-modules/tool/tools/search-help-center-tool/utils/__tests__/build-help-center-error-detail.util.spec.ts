import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { buildHelpCenterErrorDetail } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/build-help-center-error-detail.util';

const buildAxiosError = ({
  message,
  code,
  response,
}: {
  message: string;
  code?: string;
  response?: Pick<AxiosResponse, 'status' | 'data'>;
}): AxiosError =>
  new AxiosError(
    message,
    code,
    undefined,
    undefined,
    response === undefined
      ? undefined
      : ({
          ...response,
          statusText: '',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
        } as AxiosResponse),
  );

describe('buildHelpCenterErrorDetail', () => {
  it("keeps the endpoint's own reason when it uses an error field", () => {
    // The live endpoint answers `{ error: "..." }`, which the previous
    // `data?.message` lookup dropped entirely.
    const error = buildAxiosError({
      message: 'Request failed with status code 429',
      response: {
        status: 429,
        data: { error: 'Rate limit exceeded. Please try again later' },
      },
    });

    expect(buildHelpCenterErrorDetail(error)).toBe(
      'Rate limit exceeded. Please try again later (HTTP 429)',
    );
  });

  it('prefers a message field when the endpoint sends one', () => {
    const error = buildAxiosError({
      message: 'Request failed with status code 400',
      response: { status: 400, data: { message: 'Query is required' } },
    });

    expect(buildHelpCenterErrorDetail(error)).toBe(
      'Query is required (HTTP 400)',
    );
  });

  it('falls back to the axios message when the body explains nothing', () => {
    const error = buildAxiosError({
      message: 'Request failed with status code 502',
      response: { status: 502, data: '<html>Bad Gateway</html>' },
    });

    expect(buildHelpCenterErrorDetail(error)).toBe(
      'Request failed with status code 502 (HTTP 502)',
    );
  });

  it('reports transport failures that never produced a response', () => {
    const error = buildAxiosError({
      message: 'read ECONNRESET',
      code: 'ECONNRESET',
    });

    expect(buildHelpCenterErrorDetail(error)).toBe('read ECONNRESET');
  });
});
