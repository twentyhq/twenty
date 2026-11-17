import { describe, expect, it } from 'vitest';

import { extractBearerToken } from 'src/logic-functions/utils/extract-bearer-token.util';

describe('extractBearerToken', () => {
  it('should return the token of a bearer header', () => {
    expect(extractBearerToken('Bearer token')).toBe('token');
    expect(extractBearerToken('  bearer   token ')).toBe('token');
  });

  it('should return nothing for a header that is not a single bearer token', () => {
    expect(extractBearerToken(undefined)).toBeUndefined();
    expect(extractBearerToken('')).toBeUndefined();
    expect(extractBearerToken('Bearer')).toBeUndefined();
    expect(extractBearerToken('Basic token')).toBeUndefined();
    expect(extractBearerToken('Bearer token other')).toBeUndefined();
  });
});
