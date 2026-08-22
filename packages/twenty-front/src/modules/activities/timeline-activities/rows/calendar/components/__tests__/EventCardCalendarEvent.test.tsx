import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { EventCardCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventCardCalendarEvent';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { UserContext } from '@/users/contexts/UserContext';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: jest.fn(),
}));
jest.mock('@/side-panel/hooks/useOpenCalendarEventInSidePanel', () => ({
  useOpenCalendarEventInSidePanel: () => ({
    openCalendarEventInSidePanel: jest.fn(),
  }),
}));
jest.mock(
  '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup',
  () => ({ CalendarEventParticipantsAvatarGroup: () => null }),
);

const renderCard = () =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <UserContext.Provider
          value={{
            dateFormat: DateFormat.MONTH_FIRST,
            timeFormat: TimeFormat.HOUR_24,
            timeZone: 'UTC',
          }}
        >
          <EventCardCalendarEvent calendarEventId="calendar-event-id" />
        </UserContext.Provider>
      </ThemeProvider>
    </I18nProvider>,
  );

describe('EventCardCalendarEvent', () => {
  it('does not render a title masked by calendar visibility', () => {
    jest.mocked(useFindOneRecord).mockReturnValue({
      record: {
        id: 'calendar-event-id',
        title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        startsAt: '2026-08-22T10:00:00.000Z',
        endsAt: '2026-08-22T11:00:00.000Z',
        calendarEventParticipants: [],
        callRecordings: [],
      },
      loading: false,
      error: undefined,
    } as never);

    renderCard();

    expect(screen.getByText('Not shared')).toBeInTheDocument();
    expect(
      screen.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/10:00/)).not.toBeInTheDocument();
  });

  it('renders the not-shared state when record access is forbidden', () => {
    jest.mocked(useFindOneRecord).mockReturnValue({
      record: undefined,
      loading: false,
      error: new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Forbidden',
            extensions: { code: 'FORBIDDEN' },
          },
        ],
      }),
    } as never);

    renderCard();

    expect(screen.getByText('Not shared')).toBeInTheDocument();
  });

  it('fails closed when a hidden record is omitted without an error', () => {
    jest.mocked(useFindOneRecord).mockReturnValue({
      record: undefined,
      loading: false,
      error: undefined,
    } as never);

    renderCard();

    expect(screen.getByText('Not shared')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
