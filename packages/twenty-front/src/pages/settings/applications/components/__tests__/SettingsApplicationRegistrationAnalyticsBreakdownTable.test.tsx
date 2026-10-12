import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { SettingsApplicationRegistrationAnalyticsBreakdownTable } from '~/pages/settings/applications/components/SettingsApplicationRegistrationAnalyticsBreakdownTable';

const renderTable = (items: { key: string; value: number }[]) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationRegistrationAnalyticsBreakdownTable
        title="Errors by type"
        description="Logic function failures grouped by error type."
        keyHeader="Error type"
        valueHeader="Errors"
        items={items}
        formatValue={(value) => `${value} errors`}
      />
    </I18nProvider>,
  );

describe('SettingsApplicationRegistrationAnalyticsBreakdownTable', () => {
  it('should render one row per item with the formatted value', () => {
    renderTable([
      { key: 'TimeoutError', value: 12 },
      { key: 'UnhandledError', value: 3 },
    ]);

    expect(screen.getByText('Errors by type')).toBeInTheDocument();
    expect(screen.getByText('Error type')).toBeInTheDocument();
    expect(screen.getByText('TimeoutError')).toBeInTheDocument();
    expect(screen.getByText('12 errors')).toBeInTheDocument();
    expect(screen.getByText('UnhandledError')).toBeInTheDocument();
    expect(screen.getByText('3 errors')).toBeInTheDocument();
  });

  it('should render nothing when there are no items', () => {
    renderTable([]);

    expect(screen.queryByText('Errors by type')).not.toBeInTheDocument();
  });
});
