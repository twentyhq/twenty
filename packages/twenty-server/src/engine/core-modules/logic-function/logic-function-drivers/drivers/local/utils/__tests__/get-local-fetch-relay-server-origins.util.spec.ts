import { getLocalFetchRelayServerOrigins } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-fetch-relay-server-origins.util';

describe('getLocalFetchRelayServerOrigins', () => {
  it('returns the origins of the API and functions URLs', () => {
    expect(
      getLocalFetchRelayServerOrigins({
        TWENTY_API_URL: 'http://localhost:3000',
        TWENTY_FUNCTIONS_URL: 'https://apple.twenty.example/s/functions',
        OTHER_URL: 'http://internal:8080',
      }),
    ).toEqual(
      new Set(['http://localhost:3000', 'https://apple.twenty.example']),
    );
  });

  it('ignores missing and malformed values', () => {
    expect(
      getLocalFetchRelayServerOrigins({ TWENTY_API_URL: 'not a url' }),
    ).toEqual(new Set());
  });
});
