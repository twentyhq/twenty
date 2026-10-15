import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { LogConsoleAppAnalyticsBreakdownTable } from '@/log-console/components/LogConsoleAppAnalyticsBreakdownTable';

const renderTable = (items: { key: string; value: number }[]) =>
  render(
    <I18nProvider i18n={i18n}>
      <LogConsoleAppAnalyticsBreakdownTable
        title="Errors by category"
        description="Logic function failures grouped by error category."
        keyHeader="Error category"
        valueHeader="Errors"
        items={items}
        formatValue={(value) => `${value} errors`}
      />
    </I18nProvider>,
  );

describe('LogConsoleAppAnalyticsBreakdownTable', () => {
  it('should render one row per item with the formatted value', () => {
    renderTable([
      { key: 'TIMEOUT', value: 12 },
      { key: 'THROWN', value: 3 },
    ]);

    expect(screen.getByText('Errors by category')).toBeInTheDocument();
    expect(screen.getByText('Error category')).toBeInTheDocument();
    expect(screen.getByText('TIMEOUT')).toBeInTheDocument();
    expect(screen.getByText('12 errors')).toBeInTheDocument();
    expect(screen.getByText('THROWN')).toBeInTheDocument();
    expect(screen.getByText('3 errors')).toBeInTheDocument();
  });

  it('should render nothing when there are no items', () => {
    renderTable([]);

    expect(screen.queryByText('Errors by category')).not.toBeInTheDocument();
  });
});
