import { getBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/utils/getBuiltInMcpClientAppStatusesById';
import { WellKnownOAuthClient } from '~/generated-metadata/graphql';

describe('getBuiltInMcpClientAppStatusesById', () => {
  it('marks only the apps the member has not connected', () => {
    expect(
      getBuiltInMcpClientAppStatusesById({
        authorizations: [{ wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE }],
      }),
    ).toEqual({
      chatgpt: [{ type: 'notConnected' }],
    });
  });

  it('ignores authorizations of other OAuth clients', () => {
    expect(
      getBuiltInMcpClientAppStatusesById({
        authorizations: [{ wellKnownOAuthClient: null }],
      }),
    ).toEqual({
      chatgpt: [{ type: 'notConnected' }],
      claude: [{ type: 'notConnected' }],
    });
  });

  it('shows no status rather than a wrong one when the authorizations could not be loaded', () => {
    expect(
      getBuiltInMcpClientAppStatusesById({ authorizations: undefined }),
    ).toEqual({});
  });
});
