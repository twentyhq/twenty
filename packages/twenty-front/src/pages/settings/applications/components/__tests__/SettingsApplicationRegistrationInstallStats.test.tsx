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
  creditBreakdown: {
    agent: 50,
    logic: 3,
    workflow: 2,
    chargeCredits: 49.3,
    other: 0,
  },
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
        ['Agent', '50'],
        ['Logic', '3'],
        ['Workflow', '2'],
        ['chargeCredit', '49.3'],
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

  it('keeps unavailable health and credits distinct from zero', async () => {
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
    for (const label of [
      'Needs configuration',
      'Total credits consumed',
      'Agent',
      'Logic',
      'Workflow',
      'chargeCredit',
    ]) {
      expect(getRow(label).getByText('—')).toBeInTheDocument();
    }
  });

  it('shows zero counts and credits for an app without installations or usage', async () => {
    renderStats({
      stats: {
        ...STATS,
        activeInstalls: 0,
        suspendedInstalls: 0,
        autoUpdateEnabled: 0,
        workspacesNeedingAttention: 0,
        totalCreditsConsumed: 0,
        creditBreakdown: {
          agent: 0,
          logic: 0,
          workflow: 0,
          chargeCredits: 0,
          other: 0,
        },
        mostInstalledVersion: null,
        versionDistribution: [],
      },
    });

    await screen.findByText('Installs');
    expect(await getRow('Installs').findByText('0')).toBeInTheDocument();
    expect(getRow('Auto update enabled').getByText('0')).toBeInTheDocument();
    expect(
      getRow('On suspended workspaces').getByText('0'),
    ).toBeInTheDocument();
    expect(getRow('Total credits consumed').getByText('0')).toBeInTheDocument();
    expect(getRow('Distribution').getByText('—')).toBeInTheDocument();
  });

  it('includes remaining credit categories when present so the total reconciles', async () => {
    renderStats({
      stats: {
        ...STATS,
        totalCreditsConsumed: 109.3,
        creditBreakdown: { ...STATS.creditBreakdown!, other: 5 },
      },
    });

    expect(await screen.findByText('109.3')).toBeInTheDocument();
    expect(getRow('Other').getByText('5')).toBeInTheDocument();
  });
});
