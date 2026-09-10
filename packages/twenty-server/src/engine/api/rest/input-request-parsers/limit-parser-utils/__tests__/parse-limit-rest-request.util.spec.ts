import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';

describe('parseLimitRestRequest', () => {
  it('should return default if limit missing', () => {
    const request: any = { query: {} };

    expect(parseLimitRestRequest(request)).toEqual(60);
  });

  it('should return limit', () => {
    const request: any = { query: { limit: '10' } };

    expect(parseLimitRestRequest(request)).toEqual(10);
  });

  it('supports caller-specific defaults and maximums', () => {
    expect(parseLimitRestRequest({ query: {} } as any, 1000, 1000)).toBe(1000);
    expect(
      parseLimitRestRequest({ query: { limit: '1500' } } as any, 1000, 1000),
    ).toBe(1000);
  });

  it('should throw if not integer', () => {
    const request: any = { query: { limit: 'aaa' } };

    expect(() => parseLimitRestRequest(request)).toThrow(
      "limit 'aaa' is invalid. Should be an integer",
    );
  });

  it('should throw if limit negative', () => {
    const request: any = { query: { limit: -1 } };

    expect(() => parseLimitRestRequest(request)).toThrow(
      "limit '-1' is invalid. Should be an integer",
    );
  });
});
