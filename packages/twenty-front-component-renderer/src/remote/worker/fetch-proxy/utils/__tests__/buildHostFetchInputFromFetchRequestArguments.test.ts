import { buildHostFetchInputFromFetchRequestArguments } from '../buildHostFetchInputFromFetchRequestArguments';

describe('buildHostFetchInputFromFetchRequestArguments', () => {
  it('should assemble the url, method, headers and body into a host fetch input', async () => {
    await expect(
      buildHostFetchInputFromFetchRequestArguments(
        'https://api.twenty.test/graphql',
        {
          method: 'POST',
          headers: { authorization: 'Bearer token' },
          body: '{"query":"{ me }"}',
        },
      ),
    ).resolves.toEqual({
      url: 'https://api.twenty.test/graphql',
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: '{"query":"{ me }"}',
    });
  });

  it('should default the content type when the body is URLSearchParams', async () => {
    const hostFetchInput = await buildHostFetchInputFromFetchRequestArguments(
      'https://api.twenty.test/track',
      { method: 'POST', body: new URLSearchParams({ event: 'clicked' }) },
    );

    expect(hostFetchInput.headers).toEqual({
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    });
    expect(hostFetchInput.body).toBe('event=clicked');
  });

  it('should keep an explicit content type when the body is URLSearchParams', async () => {
    const hostFetchInput = await buildHostFetchInputFromFetchRequestArguments(
      'https://api.twenty.test/track',
      {
        method: 'POST',
        headers: { 'content-type': 'application/custom' },
        body: new URLSearchParams({ event: 'clicked' }),
      },
    );

    expect(hostFetchInput.headers).toEqual({
      'content-type': 'application/custom',
    });
  });

  it('should default to a GET request without headers or body', async () => {
    await expect(
      buildHostFetchInputFromFetchRequestArguments(
        'https://api.twenty.test/graphql',
        undefined,
      ),
    ).resolves.toEqual({
      url: 'https://api.twenty.test/graphql',
      method: 'GET',
      headers: {},
      body: undefined,
    });
  });
});
