import { getConnectionCheckBanner } from '@/settings/applications/utils/getConnectionCheckBanner';
import { ApplicationHealthStatus } from '~/generated-metadata/graphql';

const buildResult = ({
  status = ApplicationHealthStatus.WARNING,
  location = 'https://github.com/apps/twenty/installations/new',
}: {
  status?: ApplicationHealthStatus;
  location?: string | null;
} = {}) => ({
  __typename: 'ApplicationHealthCheckResult' as const,
  status,
  title: 'GitHub is not installed on any of your accounts',
  description: 'Install it to let Twenty reach your repositories.',
  action: {
    __typename: 'ApplicationHealthCheckAction' as const,
    label: 'Install on GitHub',
    location,
  },
});

describe('getConnectionCheckBanner', () => {
  it('opens an https action outside Twenty', () => {
    expect(getConnectionCheckBanner(buildResult())).toEqual({
      status: ApplicationHealthStatus.WARNING,
      title: 'GitHub is not installed on any of your accounts',
      description: 'Install it to let Twenty reach your repositories.',
      action: {
        kind: 'external',
        label: 'Install on GitHub',
        url: 'https://github.com/apps/twenty/installations/new',
      },
    });
  });

  it('navigates to an internal path', () => {
    expect(
      getConnectionCheckBanner(buildResult({ location: '/settings/profile' }))
        ?.action,
    ).toEqual({
      kind: 'internal',
      label: 'Install on GitHub',
      to: '/settings/profile',
    });
  });

  it.each(['javascript:alert(1)', 'http://github.com/apps', '//evil.example'])(
    'drops the button for %s',
    (location) => {
      expect(
        getConnectionCheckBanner(buildResult({ location }))?.action,
      ).toBeUndefined();
    },
  );

  it.each([ApplicationHealthStatus.OK, ApplicationHealthStatus.UNKNOWN])(
    'shows nothing for %s',
    (status) => {
      expect(getConnectionCheckBanner(buildResult({ status }))).toBeUndefined();
    },
  );
});
