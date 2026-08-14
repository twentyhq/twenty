import { getHeadersFromFetchRequestArguments } from '../getHeadersFromFetchRequestArguments';

describe('getHeadersFromFetchRequestArguments', () => {
  it('should convert init headers given as a record', () => {
    expect(
      getHeadersFromFetchRequestArguments('https://api.twenty.test', {
        headers: { 'Content-Type': 'application/json' },
      }),
    ).toEqual({ 'content-type': 'application/json' });
  });

  it('should convert init headers given as a Headers instance', () => {
    expect(
      getHeadersFromFetchRequestArguments('https://api.twenty.test', {
        headers: new Headers({ authorization: 'Bearer token' }),
      }),
    ).toEqual({ authorization: 'Bearer token' });
  });

  it('should convert init headers given as an entries array', () => {
    expect(
      getHeadersFromFetchRequestArguments('https://api.twenty.test', {
        headers: [['x-schema-version', '42']],
      }),
    ).toEqual({ 'x-schema-version': '42' });
  });

  it('should prefer init headers over Request headers when both are present', () => {
    const request = {
      url: 'https://api.twenty.test',
      headers: new Headers({ authorization: 'Bearer request-token' }),
    } as unknown as Request;

    expect(
      getHeadersFromFetchRequestArguments(request, {
        headers: { authorization: 'Bearer init-token' },
      }),
    ).toEqual({ authorization: 'Bearer init-token' });
  });

  it('should fall back to Request headers when init headers are absent', () => {
    const request = {
      url: 'https://api.twenty.test',
      headers: new Headers({ authorization: 'Bearer request-token' }),
    } as unknown as Request;

    expect(getHeadersFromFetchRequestArguments(request, undefined)).toEqual({
      authorization: 'Bearer request-token',
    });
  });

  it('should return an empty record when neither init nor Request provides headers', () => {
    expect(
      getHeadersFromFetchRequestArguments('https://api.twenty.test', undefined),
    ).toEqual({});
  });
});
