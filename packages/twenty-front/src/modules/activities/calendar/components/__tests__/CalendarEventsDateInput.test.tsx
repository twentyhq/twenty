import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { CalendarEventsDateInput } from '@/activities/calendar/components/CalendarEventsDateInput';

describe('CalendarEventsDateInput', () => {
  it('opens a calendar and returns the picked day', async () => {
    const handleChange = jest.fn();

    render(
      <JotaiProvider store={createStore()}>
        <CalendarEventsDateInput
          dropdownId="calendar-events-date-input-test"
          plainDate="2026-03-10"
          placeholder="Start date"
          onChange={handleChange}
        />
      </JotaiProvider>,
    );

    await userEvent.click(screen.getByText('Mar 10, 2026'));
    await userEvent.click(await screen.findByText('17'));

    expect(handleChange).toHaveBeenCalledWith('2026-03-17');
  });
});
