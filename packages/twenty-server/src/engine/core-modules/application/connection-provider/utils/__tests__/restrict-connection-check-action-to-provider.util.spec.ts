import { ApplicationHealthStatus } from 'twenty-shared/application';

import { restrictConnectionCheckActionToProvider } from 'src/engine/core-modules/application/connection-provider/utils/restrict-connection-check-action-to-provider.util';
import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';

const GITHUB_PROVIDER = {
  oauthConfig: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revokeEndpoint: null,
    scopes: [],
    clientIdVariable: 'GITHUB_CLIENT_ID',
    clientSecretVariable: 'GITHUB_CLIENT_SECRET',
    authorizationParams: null,
    tokenRequestContentType: 'form-urlencoded' as const,
    usePkce: true,
  },
  oauthDiscoveryConfig: null,
};

const buildResult = (
  location: string | null,
): ApplicationHealthCheckResultDTO => ({
  status: ApplicationHealthStatus.WARNING,
  title: 'GitHub is not installed on any of your accounts',
  description: null,
  action: { label: 'Install on GitHub', location },
});

describe('restrictConnectionCheckActionToProvider', () => {
  it('keeps an https action on a host of the provider', () => {
    const result = buildResult(
      'https://github.com/apps/twenty/installations/new',
    );

    expect(
      restrictConnectionCheckActionToProvider({
        result,
        provider: GITHUB_PROVIDER,
      }),
    ).toEqual(result);
  });

  it('keeps an action to an internal path', () => {
    const result = buildResult('/settings/applications');

    expect(
      restrictConnectionCheckActionToProvider({
        result,
        provider: GITHUB_PROVIDER,
      }),
    ).toEqual(result);
  });

  it.each([
    ['another host', 'https://evil.example/apps/twenty'],
    ['a look-alike subdomain', 'https://github.com.evil.example/apps'],
    ['plain http on the provider host', 'http://github.com/apps/twenty'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a protocol-relative URL', '//evil.example/apps'],
  ])('drops the action for %s', (_case, location) => {
    expect(
      restrictConnectionCheckActionToProvider({
        result: buildResult(location),
        provider: GITHUB_PROVIDER,
      }).action,
    ).toBeNull();
  });

  it('allows only internal paths for a provider without known hosts', () => {
    expect(
      restrictConnectionCheckActionToProvider({
        result: buildResult('https://github.com/apps/twenty'),
        provider: { oauthConfig: null, oauthDiscoveryConfig: null },
      }).action,
    ).toBeNull();
  });
});
