import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';

import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import {
  type ApplicationRegistration,
  type ApplicationRegistrationStats,
  FindApplicationRegistrationStatsDocument,
} from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';

const STATS: ApplicationRegistrationStats = {
  activeInstalls: 4,
  suspendedInstalls: 2,
  onLatestVersion: 2,
  updatesAvailable: 2,
  autoUpdateEnabled: 2,
  workspacesNeedingAttention: 1,
  healthCheckedWorkspaces: 2,
  totalCreditsConsumed: 104.3,
  creditBreakdown: [
    {
      key: 'type:WORKFLOW_EXECUTION',
      label: 'WORKFLOW_EXECUTION',
      operationType: 'WORKFLOW_EXECUTION',
      isAppDefined: false,
      creditsConsumed: 2,
    },
    {
      key: 'app:recordCall',
      label: 'Recorded calls',
      operationType: 'CALL_RECORDING',
      isAppDefined: true,
      creditsConsumed: 49.3,
    },
    {
      key: 'type:AI_CHAT_TOKEN',
      label: 'AI_CHAT_TOKEN',
      operationType: 'AI_CHAT_TOKEN',
      isAppDefined: false,
      creditsConsumed: 50,
    },
    {
      key: 'type:CODE_EXECUTION',
      label: 'CODE_EXECUTION',
      operationType: 'CODE_EXECUTION',
      isAppDefined: false,
      creditsConsumed: 3,
    },
  ],
  mostInstalledVersion: '1.2.3',
  versionDistribution: [
    { version: '1.2.3', count: 2 },
    { version: '1.2.2', count: 2 },
  ],
};

const renderStats = ({
  isAdminView = false,
  stats = STATS,
}: { isAdminView?: boolean; stats?: ApplicationRegistrationStats } = {}) =>
  render(
    <MockedProvider
      mocks={[
        {
          request: {
            query: isAdminView
              ? FindAdminApplicationRegistrationStatsDocument
              : FindApplicationRegistrationStatsDocument,
            variables: { id: 'registration-id' },
          },
          result: {
            data: {
              [isAdminView
                ? 'findAdminApplicationRegistrationStats'
                : 'findApplicationRegistrationStats']: stats,
            },
          },
        },
      ]}
    >
      <I18nProvider i18n={i18n}>
        <SettingsApplicationRegistrationInstallStats
          registration={{ id: 'registration-id' } as ApplicationRegistration}
          isAdminView={isAdminView}
        />
      </I18nProvider>
    </MockedProvider>,
  );

const getRow = (label: string) =>
  within(screen.getByText(label).closest('[data-table-row]') as HTMLElement);

describe('SettingsApplicationRegistrationInstallStats', () => {
  it.each([false, true])(
    'shows compact counts and credit categories for isAdminView=%s',
    async (isAdminView) => {
      renderStats({ isAdminView });

      await screen.findByText('1.2.3 (2), 1.2.2 (2)');
      for (const [label, value] of [
        ['Installs', '4'],
        ['Auto update enabled', '2'],
        ['Needs configuration', '1'],
        ['On suspended workspaces', '2'],
        ['Most installed version', '1.2.3'],
        ['Total credits consumed', '104.3'],
        ['Chats', '50'],
        ['Code Execution', '3'],
        ['Workflow Execution', '2'],
        ['Recorded calls', '49.3'],
      ]) {
        expect(
          getRow(label).getByText(value, { exact: true }),
        ).toBeInTheDocument();
      }
      expect(screen.queryByText('On latest version')).not.toBeInTheDocument();
      expect(screen.queryByText('Updates available')).not.toBeInTheDocument();
      expect(screen.queryByText(/checked in the last/)).not.toBeInTheDocument();
      expect(screen.queryByText('Other')).not.toBeInTheDocument();

      const rows = within(
        screen.getByRole('group', { name: 'Install statistics' }),
      )
        .getByText('Distribution')
        .closest('[data-table-row]');
      expect(rows?.nextElementSibling).toBeNull();
    },
  );

  it('hides unavailable health and credit data', async () => {
    renderStats({
      stats: {
        ...STATS,
        workspacesNeedingAttention: null,
        healthCheckedWorkspaces: 0,
        totalCreditsConsumed: null,
        creditBreakdown: null,
      },
    });

    await screen.findByText('1.2.3 (2), 1.2.2 (2)');
    for (const label of ['Needs configuration', 'Total credits consumed']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
    expect(
      screen.queryByRole('group', { name: 'Credit consumption' }),
    ).not.toBeInTheDocument();
  });

  it('shows a compact empty state without installations or usage', async () => {
    renderStats({
      stats: {
        ...STATS,
        activeInstalls: 0,
        suspendedInstalls: 0,
        autoUpdateEnabled: 0,
        workspacesNeedingAttention: 0,
        totalCreditsConsumed: 0,
        creditBreakdown: [],
        mostInstalledVersion: null,
        versionDistribution: [],
      },
    });

    await screen.findByText('No installations yet.');
    expect(getRow('Installs').getByText('0')).toBeInTheDocument();
    for (const label of [
      'Auto update enabled',
      'Needs configuration',
      'On suspended workspaces',
      'Total credits consumed',
      'Most installed version',
      'Distribution',
    ]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it('keeps useful installation rows when no issues or consumption are recorded', async () => {
    renderStats({
      stats: {
        ...STATS,
        autoUpdateEnabled: 0,
        workspacesNeedingAttention: 0,
        suspendedInstalls: 0,
        totalCreditsConsumed: 0,
        creditBreakdown: STATS.creditBreakdown!.map((operation) => ({
          ...operation,
          creditsConsumed: 0,
        })),
      },
    });

    await screen.findByText('1.2.3 (2), 1.2.2 (2)');
    expect(getRow('Auto update enabled').getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('Needs configuration')).not.toBeInTheDocument();
    expect(
      screen.queryByText('On suspended workspaces'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Credit consumption' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('No installations yet.')).not.toBeInTheDocument();
  });

  it('keeps historical consumption visible after all installations are removed', async () => {
    renderStats({
      stats: {
        ...STATS,
        activeInstalls: 0,
        autoUpdateEnabled: 0,
        suspendedInstalls: 0,
        workspacesNeedingAttention: 0,
        mostInstalledVersion: null,
        versionDistribution: [],
      },
    });

    await screen.findByText('No installations yet.');
    expect(getRow('Installs').getByText('0')).toBeInTheDocument();
    expect(
      getRow('Total credits consumed').getByText('104.3'),
    ).toBeInTheDocument();
    expect(getRow('Recorded calls').getByText('49.3')).toBeInTheDocument();
    expect(screen.queryByText('Distribution')).not.toBeInTheDocument();
  });

  it('shows only non-zero operations, sorted by consumption descending', async () => {
    renderStats({
      stats: {
        ...STATS,
        creditBreakdown: [
          ...STATS.creditBreakdown!,
          {
            key: 'type:WEB_SEARCH',
            operationType: 'WEB_SEARCH',
            label: 'WEB_SEARCH',
            isAppDefined: false,
            creditsConsumed: 0,
          },
        ],
      },
    });

    await screen.findByText('Recorded calls');
    const rows = screen
      .getByRole('group', { name: 'Credit consumption' })
      .querySelectorAll('[data-table-row]');

    expect([...rows].map((row) => row.firstElementChild?.textContent)).toEqual([
      'Total credits consumed',
      'Chats',
      'Recorded calls',
      'Code Execution',
      'Workflow Execution',
    ]);
    expect(screen.queryByText('Web Search')).not.toBeInTheDocument();
  });

  it('keeps very small non-zero charges visible', async () => {
    renderStats({
      stats: {
        ...STATS,
        totalCreditsConsumed: 0.000001,
        creditBreakdown: [
          {
            key: 'type:EMAIL_SEND',
            operationType: 'EMAIL_SEND',
            label: 'EMAIL_SEND',
            isAppDefined: false,
            creditsConsumed: 0.000001,
          },
        ],
      },
    });

    await screen.findByText('Email Send');
    expect(getRow('Email Send').getByText('0.000001')).toBeInTheDocument();
  });
});
