import { getRequestOriginByHeaders } from 'src/engine/core-modules/auth/utils/get-request-origin-by-headers';

describe('getRequestOriginByHeaders', () => {
  it('should return "internal-graphql-caller" when contextType is graphql', () => {
    const contextMock = { contextType: 'graphql' };
    const result = getRequestOriginByHeaders(contextMock, 'twenty.com');

    expect(result).toEqual({ callerType: 'internal-graphql-caller' });
  });

  it('should return "internal-caller" when referer hostname matches frontHostname', () => {
    const contextMock = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { referer: 'https://subdomain.twenty.com/path' },
        }),
      }),
    };
    const result = getRequestOriginByHeaders(contextMock, 'twenty.com');

    expect(result).toEqual({
      callerType: 'internal-caller',
      url: 'https://subdomain.twenty.com',
    });
  });

  it('should return "external-caller" when referer hostname does not match frontHostname', () => {
    const contextMock = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { referer: 'https://accounts.google.com/path' },
        }),
      }),
    };
    const result = getRequestOriginByHeaders(contextMock, 'twenty.com');

    expect(result).toEqual({
      callerType: 'external-caller',
      url: 'https://accounts.google.com',
    });
  });
});
