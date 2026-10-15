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
  activeInstalls: 24,
  suspendedInstalls: 2,
  onLatestVersion: 18,
  updatesAvailable: 6,
  autoUpdateEnabled: 20,
  workspacesNeedingAttention: 3,
  healthCheckedWorkspaces: 12,
  totalCreditsConsumed: 1234.5,
  mostInstalledVersion: '2.0.0',
  versionDistribution: [
    { version: '2.0.0', count: 18 },
    { version: '1.0.0', count: 6 },
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

const getValue = (label: string) =>
  within(screen.getByText(label).closest('div')!).getByRole('definition');

describe('SettingsApplicationRegistrationInstallStats', () => {
  it.each([false, true])(
    'shows adoption, health, and credit statistics for isAdminView=%s',
    async (isAdminView) => {
      renderStats({ isAdminView });

      expect(await screen.findByText('18 / 24 · 75%')).toBeInTheDocument();
      expect(getValue('Installed workspaces')).toHaveTextContent('24');
      expect(screen.getByText('2 on suspended workspaces')).toBeInTheDocument();
      expect(getValue('Updates available')).toHaveTextContent('6');
      expect(getValue('Auto-update enabled')).toHaveTextContent('20 / 24');
      expect(getValue('Needs configuration or reconnection')).toHaveTextContent(
        '3 / 24',
      );
      expect(getValue('Total credits consumed')).toHaveTextContent('1,234.5');
      expect(getValue('Distribution')).toHaveTextContent(
        '2.0.0 (18), 1.0.0 (6)',
      );
    },
  );

  it('keeps unknown metrics distinct from zero', async () => {
    renderStats({
      stats: {
        ...STATS,
        onLatestVersion: null,
        updatesAvailable: null,
        workspacesNeedingAttention: null,
        healthCheckedWorkspaces: 0,
        totalCreditsConsumed: null,
      },
    });

    await screen.findByText('20 / 24');
    for (const label of [
      'On latest version',
      'Updates available',
      'Needs configuration or reconnection',
      'Total credits consumed',
    ]) {
      expect(getValue(label)).toHaveTextContent('—');
    }
  });

  it('handles an app with no installations without displaying an invalid percentage', async () => {
    renderStats({
      stats: {
        ...STATS,
        activeInstalls: 0,
        suspendedInstalls: 0,
        onLatestVersion: 0,
        updatesAvailable: 0,
        autoUpdateEnabled: 0,
        workspacesNeedingAttention: 0,
        healthCheckedWorkspaces: 0,
        totalCreditsConsumed: 0,
        mostInstalledVersion: null,
        versionDistribution: [],
      },
    });

    await screen.findByText('0 on suspended workspaces');
    expect(getValue('On latest version')).toHaveTextContent('0 / 0');
    expect(getValue('On latest version')).not.toHaveTextContent('%');
    expect(getValue('Total credits consumed')).toHaveTextContent('0');
    expect(getValue('Distribution')).toHaveTextContent('—');
  });
});
