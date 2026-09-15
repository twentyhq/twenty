import { getApiTypeFromPath } from 'src/engine/core-modules/usage/utils/get-api-type-from-path.util';

describe('getApiTypeFromPath', () => {
  it.each([
    ['/graphql', 'CORE_GQL'],
    ['/rest/people', 'CORE_REST'],
    ['/rest/batch/people', 'CORE_REST'],
    ['/mcp', 'MCP'],
  ])('reads the api type of %s', (path, expected) => {
    expect(getApiTypeFromPath(path)).toBe(expected);
  });

  it.each(['/metadata', '/auth/token', '/files/logo.png', '/'])(
    'leaves %s unattributed',
    (path) => {
      expect(getApiTypeFromPath(path)).toBeUndefined();
    },
  );
});
