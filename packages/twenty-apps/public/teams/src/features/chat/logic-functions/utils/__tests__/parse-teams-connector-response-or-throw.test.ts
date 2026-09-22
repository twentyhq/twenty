import { describe, expect, it } from 'vitest';

import { parseTeamsConnectorResponseOrThrow } from 'src/features/chat/logic-functions/utils/parse-teams-connector-response-or-throw';

describe('parseTeamsConnectorResponseOrThrow', () => {
  it('should parse a JSON payload', () => {
    expect(
      parseTeamsConnectorResponseOrThrow<{ id: string }>({
        responseBody: '{"id":"1234"}',
        method: 'POST',
        path: '/v3/conversations/a/activities',
      }),
    ).toEqual({ id: '1234' });
  });

  it('should throw on an empty body rather than hand back undefined', () => {
    expect(() =>
      parseTeamsConnectorResponseOrThrow({
        responseBody: '',
        method: 'POST',
        path: '/v3/conversations/a/activities',
      }),
    ).toThrow('returned an empty body');
  });

  it('should throw on a body that is not valid JSON', () => {
    expect(() =>
      parseTeamsConnectorResponseOrThrow({
        responseBody: '<html>gateway timeout</html>',
        method: 'GET',
        path: '/v3/conversations/a/members/b',
      }),
    ).toThrow('not valid JSON');
  });
});
