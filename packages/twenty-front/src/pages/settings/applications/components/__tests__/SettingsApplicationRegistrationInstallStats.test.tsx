import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';

import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import {
  type ApplicationRegistrationStats,
  FindApplicationRegistrationStatsDocument,
  UsageOperationType,
} from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';

const STATS: ApplicationRegistrationStats = {
  activeInstalls: 4,
  suspendedInstalls: 0,
  autoUpdateEnabled: 2,
  mostInstalledVersion: '1.2.3',
  versionDistribution: [{ version: '1.2.3', count: 4 }],
  totalCreditsUsed: 3.000001,
  creditsUsedBreakdown: [
    {
      label: null,
      operation: UsageOperationType.CODE_EXECUTION,
      creditsUsed: 3,
    },
    { label: 'HISTORICAL_OPERATION', operation: null, creditsUsed: 0.000001 },
  ],
};

const renderStats = (stats = STATS, isAdminView = false) => {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink(
      (['30d', '7d', '90d'] as const).map((period) => ({
        request: {
          query: isAdminView
            ? FindAdminApplicationRegistrationStatsDocument
            : FindApplicationRegistrationStatsDocument,
          variables: { id: 'registration-id', ...getPeriodDates(period) },
        },
        result: {
          data: {
            [isAdminView
              ? 'findAdminApplicationRegistrationStats'
              : 'findApplicationRegistrationStats']:
              period === '30d' ? stats : { ...stats, totalCreditsUsed: 7 },
          },
        },
        delay: 0,
      })),
    ),
  });

  return render(
    <JotaiProvider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <ApolloAdminClientContext.Provider value={client}>
          <ApolloProvider client={client}>
            <SettingsApplicationRegistrationInstallStats
              registration={{ id: 'registration-id' }}
              isAdminView={isAdminView}
            />
          </ApolloProvider>
        </ApolloAdminClientContext.Provider>
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('Application registration statistics', () => {
  it.each([false, true])(
    'shows credit consumption for owner/admin view: %s',
    async (isAdminView) => {
      renderStats(STATS, isAdminView);

      expect(await screen.findByText('3.000001')).toBeVisible();
      expect(screen.getByText('Code Execution')).toBeVisible();
      expect(screen.getByText('HISTORICAL_OPERATION')).toBeVisible();
      expect(screen.getByText('0.000001')).toBeVisible();
      expect(
        screen.queryByText('On suspended workspaces'),
      ).not.toBeInTheDocument();
    },
  );

  it('requests the selected credit period', async () => {
    const user = userEvent.setup();
    renderStats();
    expect(await screen.findByText('3.000001')).toBeVisible();
    await user.click(screen.getByText('Last 30 days'));
    await user.click(await screen.findByText('Last 7 days'));
    expect(await screen.findByText('7')).toBeVisible();
  });

  it.each([null, 0])(
    'distinguishes unavailable usage from zero: %s',
    async (totalCreditsUsed) => {
      renderStats({
        ...STATS,
        totalCreditsUsed,
        creditsUsedBreakdown: totalCreditsUsed === null ? null : [],
      });

      await screen.findByText('1.2.3');
      const credits = within(
        screen.getByRole('group', { name: 'Credit consumption' }),
      );
      expect(
        credits.getByText(totalCreditsUsed === null ? '—' : '0'),
      ).toBeVisible();
    },
  );
});
