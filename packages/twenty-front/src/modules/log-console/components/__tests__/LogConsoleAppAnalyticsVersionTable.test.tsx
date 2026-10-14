import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { LogConsoleAppAnalyticsVersionTable } from '@/log-console/components/LogConsoleAppAnalyticsVersionTable';

const renderTable = (
  versions: Parameters<
    typeof LogConsoleAppAnalyticsVersionTable
  >[0]['versions'],
) =>
  render(
    <I18nProvider i18n={i18n}>
      <LogConsoleAppAnalyticsVersionTable versions={versions} />
    </I18nProvider>,
  );

describe('LogConsoleAppAnalyticsVersionTable', () => {
  it('should show each version with its installs, failures and error rate', () => {
    renderTable([
      {
        version: '1.3.0',
        activeWorkspaces: 4,
        installSucceeded: 2,
        installFailed: 0,
        upgradeSucceeded: 5,
        upgradeFailed: 1,
        functionExecutions: 200,
        functionErrors: 3,
      },
      {
        version: '1.2.0',
        activeWorkspaces: 9,
        installSucceeded: 11,
        installFailed: 0,
        upgradeSucceeded: 0,
        upgradeFailed: 0,
        functionExecutions: 0,
        functionErrors: 0,
      },
    ]);

    expect(screen.getByText('Versions')).toBeInTheDocument();
    expect(screen.getByText('1.3.0')).toBeInTheDocument();
    expect(screen.getByText('7 (1 failed)')).toBeInTheDocument();
    expect(screen.getByText('3 (1.5%)')).toBeInTheDocument();
    expect(screen.getByText('1.2.0')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('should render nothing when no version reported activity', () => {
    renderTable([]);

    expect(screen.queryByText('Versions')).not.toBeInTheDocument();
  });
});
