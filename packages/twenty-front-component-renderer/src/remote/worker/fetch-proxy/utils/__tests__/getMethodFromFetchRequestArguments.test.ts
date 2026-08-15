import { getMethodFromFetchRequestArguments } from '../getMethodFromFetchRequestArguments';

describe('getMethodFromFetchRequestArguments', () => {
  it('should prefer the init method when both init and Request provide one', () => {
    const request = { url: 'https://api.twenty.test', method: 'PUT' };

    expect(
      getMethodFromFetchRequestArguments(request as unknown as Request, {
        method: 'POST',
      }),
    ).toBe('POST');
  });

  it('should use the Request method when init has no method', () => {
    const request = { url: 'https://api.twenty.test', method: 'DELETE' };

    expect(
      getMethodFromFetchRequestArguments(
        request as unknown as Request,
        undefined,
      ),
    ).toBe('DELETE');
  });

  it('should default to GET when input is a string and init has no method', () => {
    expect(
      getMethodFromFetchRequestArguments('https://api.twenty.test', undefined),
    ).toBe('GET');
  });
});
