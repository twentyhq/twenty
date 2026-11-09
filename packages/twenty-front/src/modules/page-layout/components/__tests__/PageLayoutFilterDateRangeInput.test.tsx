import { PageLayoutFilterDateRangeInput } from '@/page-layout/components/PageLayoutFilterDateRangeInput';
import { getPageLayoutFilterDateRange } from '@/page-layout/utils/getPageLayoutFilterDateRange';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { useState } from 'react';

// Exposes the month the calendar shows, which the real one only draws
jest.mock('twenty-ui/components/input', () => ({
  ...jest.requireActual('twenty-ui/components/input'),
  DatePicker: ({ viewedMonth }: { viewedMonth: string }) => (
    <div data-testid="calendar" data-viewed-month={viewedMonth} />
  ),
}));

i18n.load('en', {});
i18n.activate('en');

type DateRange = { startDate: string | null; endDate: string | null };

const renderInput = (dateRange: DateRange) => {
  const renderWithRange = (range: DateRange) => (
    <JotaiProvider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <PageLayoutFilterDateRangeInput
          dateRange={range}
          onChange={jest.fn()}
        />
      </I18nProvider>
    </JotaiProvider>
  );
  render(renderWithRange(dateRange));

  return {
    getViewedMonth: () => screen.getByTestId('calendar').dataset.viewedMonth,
  };
};

describe('PageLayoutFilterDateRangeInput', () => {
  it('should keep the start month when moving on to an empty end date', async () => {
    const { getViewedMonth } = renderInput({
      startDate: '2024-01-10',
      endDate: null,
    });

    expect(getViewedMonth()).toBe('2024-01');

    await userEvent.click(screen.getByRole('textbox', { name: 'End date' }));

    expect(getViewedMonth()).toBe('2024-01');
  });

  it('should show the end month while the end date is edited', async () => {
    const { getViewedMonth } = renderInput({
      startDate: '2024-01-10',
      endDate: '2024-03-05',
    });

    await userEvent.click(screen.getByRole('textbox', { name: 'End date' }));

    expect(getViewedMonth()).toBe('2024-03');
  });

  it('should move to the month of a start date typed in an empty range', async () => {
    const DateRangeInputWithState = () => {
      const [dateRange, setDateRange] = useState<DateRange>({
        startDate: null,
        endDate: null,
      });

      return (
        <PageLayoutFilterDateRangeInput
          dateRange={dateRange}
          onChange={(value) =>
            setDateRange(getPageLayoutFilterDateRange(value))
          }
        />
      );
    };

    render(
      <JotaiProvider store={createStore()}>
        <I18nProvider i18n={i18n}>
          <DateRangeInputWithState />
        </I18nProvider>
      </JotaiProvider>,
    );

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Start date' }),
      '01102024',
    );

    expect(screen.getByTestId('calendar').dataset.viewedMonth).toBe('2024-01');
  });
});
