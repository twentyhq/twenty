import { getLocalFetchRelayServerOrigin } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-fetch-relay-server-origin.util';

describe('getLocalFetchRelayServerOrigin', () => {
  it('returns the origin of the API URL only', () => {
    expect(
      getLocalFetchRelayServerOrigin({
        TWENTY_API_URL: 'http://localhost:3000/graphql',
        TWENTY_FUNCTIONS_URL: 'https://custom-domain.example/s',
      }),
    ).toBe('http://localhost:3000');
  });

  it('ignores missing and malformed values', () => {
    expect(getLocalFetchRelayServerOrigin({})).toBeUndefined();
    expect(
      getLocalFetchRelayServerOrigin({ TWENTY_API_URL: 'not a url' }),
    ).toBeUndefined();
  });
});
