import { extractBearerToken } from 'src/engine/core-modules/server-route-trigger/utils/extract-bearer-token.util';

describe('extractBearerToken', () => {
  it.each([
    ['Bearer abc.def.ghi', 'abc.def.ghi'],
    ['bearer abc.def.ghi', 'abc.def.ghi'],
    ['  Bearer   abc.def.ghi  ', 'abc.def.ghi'],
  ])('should extract the token from %p', (authorizationHeader, token) => {
    expect(extractBearerToken(authorizationHeader)).toBe(token);
  });

  it.each([
    undefined,
    '',
    'Bearer',
    'Bearer ',
    'Basic abc.def.ghi',
    'Bearer abc def',
    'abc.def.ghi',
  ])('should return undefined for %p', (authorizationHeader) => {
    expect(extractBearerToken(authorizationHeader)).toBeUndefined();
  });
});
