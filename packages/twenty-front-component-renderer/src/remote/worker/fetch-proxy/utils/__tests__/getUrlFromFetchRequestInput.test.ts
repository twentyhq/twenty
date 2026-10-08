import { getUrlFromFetchRequestInput } from '../getUrlFromFetchRequestInput';

describe('getUrlFromFetchRequestInput', () => {
  it('should return the string when input is a string', () => {
    expect(getUrlFromFetchRequestInput('https://api.twenty.test/graphql')).toBe(
      'https://api.twenty.test/graphql',
    );
  });

  it('should return the href when input is a URL instance', () => {
    expect(
      getUrlFromFetchRequestInput(new URL('https://api.twenty.test/graphql')),
    ).toBe('https://api.twenty.test/graphql');
  });

  it('should return the url property when input is a Request object', () => {
    const request = {
      url: 'https://api.twenty.test/graphql',
    } as unknown as Request;

    expect(getUrlFromFetchRequestInput(request)).toBe(
      'https://api.twenty.test/graphql',
    );
  });
});
