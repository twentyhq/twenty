import { getTextBodyFromFetchRequestArguments } from '../getTextBodyFromFetchRequestArguments';

const createRequestInput = ({
  headers,
  body,
}: {
  headers?: Record<string, string>;
  body?: string;
}): Request =>
  ({
    url: 'https://api.twenty.test/graphql',
    headers: new Headers(headers),
    clone: () => ({ text: async () => body ?? '' }),
  }) as unknown as Request;

describe('getTextBodyFromFetchRequestArguments', () => {
  it('should return the init body when it is a string', async () => {
    await expect(
      getTextBodyFromFetchRequestArguments('https://api.twenty.test', {
        body: '{"query":"{ me }"}',
      }),
    ).resolves.toBe('{"query":"{ me }"}');
  });

  it('should stringify URLSearchParams init bodies', async () => {
    await expect(
      getTextBodyFromFetchRequestArguments('https://api.twenty.test', {
        body: new URLSearchParams({ event: 'clicked' }),
      }),
    ).resolves.toBe('event=clicked');
  });

  it('should return undefined when no body is provided', async () => {
    await expect(
      getTextBodyFromFetchRequestArguments(
        'https://api.twenty.test',
        undefined,
      ),
    ).resolves.toBeUndefined();
  });

  it('should read the text body from a cloned Request when init has no body', async () => {
    const request = createRequestInput({
      headers: { 'content-type': 'application/json' },
      body: '{"query":"{ me }"}',
    });

    await expect(
      getTextBodyFromFetchRequestArguments(request, undefined),
    ).resolves.toBe('{"query":"{ me }"}');
  });

  it('should return undefined when the Request body is empty', async () => {
    const request = createRequestInput({});

    await expect(
      getTextBodyFromFetchRequestArguments(request, undefined),
    ).resolves.toBeUndefined();
  });

  it('should reject with a TypeError when the Request content type is not text', async () => {
    const request = createRequestInput({
      headers: { 'content-type': 'multipart/form-data; boundary=boundary' },
      body: '--boundary\r\nbinary-payload\r\n--boundary--',
    });

    await expect(
      getTextBodyFromFetchRequestArguments(request, undefined),
    ).rejects.toBeInstanceOf(TypeError);
    await expect(
      getTextBodyFromFetchRequestArguments(request, undefined),
    ).rejects.toThrow('multipart/form-data');
  });

  it('should reject with a TypeError when the init body is FormData', async () => {
    await expect(
      getTextBodyFromFetchRequestArguments('https://api.twenty.test', {
        body: new FormData(),
      }),
    ).rejects.toBeInstanceOf(TypeError);
  });

  it('should reject with a TypeError when the init body is a Blob', async () => {
    await expect(
      getTextBodyFromFetchRequestArguments('https://api.twenty.test', {
        body: new Blob(['x']),
      }),
    ).rejects.toBeInstanceOf(TypeError);
  });
});
