import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { Suspense } from 'react';

import { LogConsoleAppAnalyticsRangeDropdown } from '@/log-console/components/LogConsoleAppAnalyticsRangeDropdown';
import { type LogConsoleAppAnalyticsRange } from '@/log-console/types/LogConsoleAppAnalyticsRange';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const renderDropdown = (range: LogConsoleAppAnalyticsRange) => {
  resetJotaiStore();

  const onRangeChange = jest.fn();

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <Suspense fallback={null}>
          <LogConsoleAppAnalyticsRangeDropdown
            range={range}
            onRangeChange={onRangeChange}
          />
        </Suspense>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { onRangeChange };
};

describe('LogConsoleAppAnalyticsRangeDropdown', () => {
  it('should offer the presets, a custom range and the retention', async () => {
    const user = userEvent.setup();

    renderDropdown({ kind: 'preset', preset: '30d' });

    await user.click(screen.getByText('Last 30 days'));

    expect(
      await screen.findByRole('option', { name: 'Last 30 days' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Last year' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'All time' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Custom range' })).toBeVisible();
    expect(screen.getByText('Retention')).toBeVisible();
    expect(screen.getByText('1 year')).toBeVisible();
  });

  it('should select a preset', async () => {
    const user = userEvent.setup();

    const { onRangeChange } = renderDropdown({
      kind: 'preset',
      preset: '30d',
    });

    await user.click(screen.getByText('Last 30 days'));
    await user.click(await screen.findByRole('option', { name: 'All time' }));

    expect(onRangeChange).toHaveBeenCalledWith({
      kind: 'preset',
      preset: 'all',
    });
  });

  it('should label a custom range with its dates and open the start date picker', async () => {
    const user = userEvent.setup();

    renderDropdown({
      kind: 'custom',
      startDate: '2026-10-01',
      endDate: '2026-10-05',
    });

    await user.click(screen.getByText('Oct 1, 2026 – Oct 5, 2026'));
    await user.click(
      await screen.findByRole('option', { name: /Custom range/ }),
    );

    expect(await screen.findByText('Start date')).toBeVisible();
  });
});
