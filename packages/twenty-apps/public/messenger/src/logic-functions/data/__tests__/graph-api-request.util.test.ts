import axios, { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { GraphApiError } from 'src/logic-functions/data/graph-api.error';

const ACCESS_TOKEN = 'secret-page-token';

const buildAxiosError = (responseData?: unknown) => {
  const config = {
    headers: new AxiosHeaders({ Authorization: `Bearer ${ACCESS_TOKEN}` }),
  };

  return new AxiosError(
    'Request failed',
    'ERR_BAD_RESPONSE',
    config,
    undefined,
    responseData === undefined
      ? undefined
      : {
          data: responseData,
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config,
        },
  );
};

const requestMe = () =>
  graphApiRequest({ accessToken: ACCESS_TOKEN, method: 'GET', path: 'me' });

describe('graphApiRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws a GraphApiError with the Meta error code', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(
      buildAxiosError({ error: { message: 'Invalid token', code: 190 } }),
    );

    const error = await requestMe().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(GraphApiError);
    expect(error).toHaveProperty('code', 190);
  });

  it('does not expose the access token when Meta returns no error body', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(
      buildAxiosError('Bad Gateway'),
    );

    const error = await requestMe().catch((caught: unknown) => caught);

    expect(error).not.toBeInstanceOf(AxiosError);
    expect(JSON.stringify(error)).not.toContain(ACCESS_TOKEN);
    expect(error).toHaveProperty(
      'message',
      'Messenger API request failed on GET /me: 500',
    );
  });

  it('does not expose the access token on network failures', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(buildAxiosError());

    const error = await requestMe().catch((caught: unknown) => caught);

    expect(error).not.toBeInstanceOf(AxiosError);
    expect(error).toHaveProperty(
      'message',
      'Messenger API request failed on GET /me: ERR_BAD_RESPONSE',
    );
  });
});
