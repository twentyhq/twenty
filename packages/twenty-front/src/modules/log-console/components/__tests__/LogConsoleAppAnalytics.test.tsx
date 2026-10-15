import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { LogConsoleAppAnalytics } from '@/log-console/components/LogConsoleAppAnalytics';
import { logConsoleAppAnalyticsApplicationIdState } from '@/log-console/states/logConsoleAppAnalyticsApplicationIdState';
import { logConsoleAppAnalyticsRangeState } from '@/log-console/states/logConsoleAppAnalyticsRangeState';
import { logConsoleAppAnalyticsScopeState } from '@/log-console/states/logConsoleAppAnalyticsScopeState';
import { type LogConsoleAppAnalyticsRange } from '@/log-console/types/LogConsoleAppAnalyticsRange';
import { type LogConsoleAppAnalyticsTarget } from '@/log-console/types/LogConsoleAppAnalyticsTarget';
import { getLogConsoleAppAnalyticsPeriod } from '@/log-console/utils/getLogConsoleAppAnalyticsPeriod';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationSourceType,
  FindManyApplicationRegistrationsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

jest.mock('@/log-console/components/LogConsoleAppAnalyticsReport', () => ({
  LogConsoleAppAnalyticsReport: ({
    target,
    range,
    now,
  }: {
    target: LogConsoleAppAnalyticsTarget;
    range: LogConsoleAppAnalyticsRange;
    now: string;
  }) => (
    <>
      <div>
        {target.scope === 'current-workspace'
          ? `Workspace report for ${target.applicationId}`
          : `All workspaces report for ${target.applicationRegistrationId}`}
      </div>
      <div>
        Period end: {getLogConsoleAppAnalyticsPeriod({ range, now }).periodEnd}
      </div>
    </>
  ),
}));

jest.mock(
  '@/applications/hooks/useRefetchOnApplicationRegistrationChange',
  () => ({ useRefetchOnApplicationRegistrationChange: () => undefined }),
);

const INSTALLED_APPLICATIONS: FlatApplication[] = [
  {
    id: 'application-1',
    universalIdentifier: 'application-1-universal',
    name: 'Call recorder',
    description: '',
    version: '1.0.0',
    applicationRegistrationId: 'installed-registration-1',
  },
  {
    id: 'application-2',
    universalIdentifier: 'application-2-universal',
    name: 'Slack',
    description: '',
    version: '2.0.0',
    applicationRegistrationId: 'installed-registration-2',
  },
  {
    id: 'standard-application',
    universalIdentifier: 'standard-application-universal',
    name: 'Standard',
    description: '',
    version: '1.0.0',
    applicationRegistrationId: null,
  },
];

const OWNED_REGISTRATIONS = [{ id: 'registration-1', name: 'Lead scoring' }];

const renderAppAnalytics = ({
  permissionFlags,
  installedApplications = INSTALLED_APPLICATIONS,
  ownedRegistrations = OWNED_REGISTRATIONS,
}: {
  permissionFlags: PermissionFlagType[];
  installedApplications?: FlatApplication[];
  ownedRegistrations?: { id: string; name: string }[];
}) => {
  resetJotaiStore();
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
  });
  jotaiStore.set(metadataStoreState.atomFamily('applications'), {
    current: installedApplications,
    draft: [],
    status: 'up-to-date',
  } as never);

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MockedProvider
          mocks={[
            {
              request: { query: FindManyApplicationRegistrationsDocument },
              result: {
                data: {
                  findManyApplicationRegistrations: ownedRegistrations.map(
                    (registration) => ({
                      __typename: 'ApplicationRegistration',
                      ...registration,
                      universalIdentifier: `${registration.id}-universal`,
                      sourceType: ApplicationRegistrationSourceType.LOCAL,
                      logoUrl: null,
                      createdAt: '2026-09-20T15:45:00.000Z',
                    }),
                  ),
                },
              },
            },
          ]}
        >
          <LogConsoleAppAnalytics />
        </MockedProvider>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('LogConsoleAppAnalytics', () => {
  afterEach(() => {
    localStorage.clear();
    jest.useRealTimers();
  });

  it('should explain that there is nothing to report when no app is installed or developed here', async () => {
    renderAppAnalytics({
      permissionFlags: [
        PermissionFlagType.APPLICATIONS,
        PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      ],
      installedApplications: [],
      ownedRegistrations: [],
    });

    expect(
      await screen.findByText(
        'No app to report on yet. Analytics appear here for the apps installed in this workspace and the apps it develops.',
      ),
    ).toBeInTheDocument();
  });

  it('should report on the first app installed in this workspace by default', async () => {
    renderAppAnalytics({
      permissionFlags: [
        PermissionFlagType.APPLICATIONS,
        PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      ],
    });

    expect(
      await screen.findByText('Workspace report for application-1'),
    ).toBeInTheDocument();
    expect(screen.getByText('This workspace')).toBeInTheDocument();
    expect(screen.getByText('Call recorder')).toBeInTheDocument();
  });

  it('should report across workspaces on an app this workspace develops', async () => {
    renderAppAnalytics({
      permissionFlags: [
        PermissionFlagType.APPLICATIONS,
        PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      ],
    });
    act(() => {
      jotaiStore.set(logConsoleAppAnalyticsScopeState.atom, 'all-workspaces');
    });

    expect(
      await screen.findByText('All workspaces report for registration-1'),
    ).toBeInTheDocument();
    expect(screen.getByText('Lead scoring')).toBeInTheDocument();
  });

  it('should report on the previously selected installed app', async () => {
    renderAppAnalytics({
      permissionFlags: [PermissionFlagType.APPLICATIONS],
    });
    act(() => {
      jotaiStore.set(
        logConsoleAppAnalyticsApplicationIdState.atom,
        'application-2',
      );
    });

    expect(
      await screen.findByText('Workspace report for application-2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
  });

  it('should pause and resume updates without changing the selected app or range', async () => {
    const user = userEvent.setup();

    renderAppAnalytics({
      permissionFlags: [PermissionFlagType.APPLICATIONS],
    });
    act(() => {
      jotaiStore.set(
        logConsoleAppAnalyticsApplicationIdState.atom,
        'application-2',
      );
    });

    expect(
      await screen.findByText('Workspace report for application-2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
    expect(
      screen.getByText('Workspace report for application-2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resume' }));

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(
      screen.getByText('Workspace report for application-2'),
    ).toBeInTheDocument();
  });

  it('should advance a mounted preset report across UTC midnight without new analytics data', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-15T23:59:59.000Z'));

    renderAppAnalytics({ permissionFlags: [PermissionFlagType.APPLICATIONS] });

    expect(
      screen.getByText('Period end: 2026-10-16T00:00:00Z'),
    ).toBeInTheDocument();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_001);
    });

    expect(
      screen.getByText('Period end: 2026-10-17T00:00:00Z'),
    ).toBeInTheDocument();
  });

  it('should hold the report period across UTC midnight while paused and catch up on resume', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-15T23:59:59.000Z'));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderAppAnalytics({ permissionFlags: [PermissionFlagType.APPLICATIONS] });

    expect(
      screen.getByText('Period end: 2026-10-16T00:00:00Z'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_001);
    });

    expect(
      screen.getByText('Period end: 2026-10-16T00:00:00Z'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resume' }));

    expect(
      screen.getByText('Period end: 2026-10-17T00:00:00Z'),
    ).toBeInTheDocument();
  });

  it('should hide live updates for a historical custom range', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-15T12:00:00.000Z'));

    renderAppAnalytics({ permissionFlags: [PermissionFlagType.APPLICATIONS] });
    act(() => {
      jotaiStore.set(logConsoleAppAnalyticsRangeState.atom, {
        kind: 'custom',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });
    });

    expect(
      screen.queryByRole('button', { name: 'Pause' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Resume' }),
    ).not.toBeInTheDocument();
  });

  it('should only report on this workspace for members who cannot read app registrations', async () => {
    renderAppAnalytics({
      permissionFlags: [PermissionFlagType.APPLICATIONS],
    });
    act(() => {
      jotaiStore.set(logConsoleAppAnalyticsScopeState.atom, 'all-workspaces');
    });

    expect(
      await screen.findByText('Workspace report for application-1'),
    ).toBeInTheDocument();
    expect(screen.queryByText('All workspaces')).not.toBeInTheDocument();
  });

  it('should fall back to apps this workspace develops when no installed app reports analytics', async () => {
    renderAppAnalytics({
      permissionFlags: [
        PermissionFlagType.APPLICATIONS,
        PermissionFlagType.API_KEYS_AND_WEBHOOKS,
      ],
      installedApplications: [INSTALLED_APPLICATIONS[2]],
    });

    expect(
      await screen.findByText('All workspaces report for registration-1'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Standard')).not.toBeInTheDocument();
  });
});
