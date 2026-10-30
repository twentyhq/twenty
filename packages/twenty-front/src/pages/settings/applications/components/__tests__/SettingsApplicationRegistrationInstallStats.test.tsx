import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { billingState } from '@/client-config/states/billingState';
import { getCurrentMonthPeriodDates } from '@/settings/usage/utils/getCurrentMonthPeriodDates';

import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import {
  type ApplicationRegistrationStats,
  type Billing,
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
  totalCreditsUsed: 1172.966302,
  creditsUsedBreakdown: [
    {
      label: null,
      operation: UsageOperationType.CODE_EXECUTION,
      creditsUsed: 1171.704,
    },
    { label: 'HISTORICAL_OPERATION', operation: null, creditsUsed: 1.262302 },
  ],
};

const renderStats = ({
  stats = STATS,
  isAdminView = false,
  isBillingEnabled = true,
}: {
  stats?: ApplicationRegistrationStats;
  isAdminView?: boolean;
  isBillingEnabled?: boolean;
} = {}) => {
  const store = createStore();

  store.set(billingState.atom, { isBillingEnabled } as Billing);

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink([
      {
        request: {
          query: isAdminView
            ? FindAdminApplicationRegistrationStatsDocument
            : FindApplicationRegistrationStatsDocument,
          variables: {
            id: 'registration-id',
            ...getCurrentMonthPeriodDates(),
          },
        },
        result: {
          data: {
            [isAdminView
              ? 'findAdminApplicationRegistrationStats'
              : 'findApplicationRegistrationStats']: stats,
          },
        },
        delay: 0,
      },
    ]),
  });

  return render(
    <JotaiProvider store={store}>
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
    'shows this month credit consumption for owner/admin view: %s',
    async (isAdminView) => {
      renderStats({ isAdminView });

      expect(await screen.findByText('1,172')).toBeVisible();
      expect(screen.getByText('Credits used this month')).toBeVisible();
      expect(screen.getByText('Code Execution')).toBeVisible();
      expect(screen.getByText('1,171')).toBeVisible();
      expect(screen.getByText('HISTORICAL_OPERATION')).toBeVisible();
      expect(screen.getByText('1.26')).toBeVisible();
      expect(
        screen.queryByText('On suspended workspaces'),
      ).not.toBeInTheDocument();
    },
  );

  it.each([null, 0])(
    'distinguishes unavailable usage from zero: %s',
    async (totalCreditsUsed) => {
      renderStats({
        stats: {
          ...STATS,
          totalCreditsUsed,
          creditsUsedBreakdown: totalCreditsUsed === null ? null : [],
        },
      });

      await screen.findByText('1.2.3');
      expect(
        screen.getByText(totalCreditsUsed === null ? '—' : '0'),
      ).toBeVisible();
    },
  );

  it('hides credit consumption when billing is disabled', async () => {
    renderStats({ isBillingEnabled: false });

    await screen.findByText('1.2.3');
    expect(
      screen.queryByText('Credits used this month'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Code Execution')).not.toBeInTheDocument();
  });
});
