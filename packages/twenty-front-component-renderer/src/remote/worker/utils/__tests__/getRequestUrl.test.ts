import { getRequestUrl } from '../getRequestUrl';

describe('getRequestUrl', () => {
  it('should return the string when input is a string', () => {
    expect(getRequestUrl('https://api.twenty.test/graphql')).toBe(
      'https://api.twenty.test/graphql',
    );
  });

  it('should return the href when input is a URL instance', () => {
    expect(getRequestUrl(new URL('https://api.twenty.test/graphql'))).toBe(
      'https://api.twenty.test/graphql',
    );
  });

  it('should return the url property when input is a Request object', () => {
    const request = {
      url: 'https://api.twenty.test/graphql',
    } as unknown as Request;

    expect(getRequestUrl(request)).toBe('https://api.twenty.test/graphql');
  });
});
