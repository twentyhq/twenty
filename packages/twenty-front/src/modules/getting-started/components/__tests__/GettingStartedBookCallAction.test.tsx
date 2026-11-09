import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallAction } from '@/getting-started/components/GettingStartedBookCallAction';
import { type CalSlot } from '@/getting-started/types/CalSlot';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

type CalApiSubscription = { action: string; callback: () => void };

const mockCalApi = jest.fn<void, [string, CalApiSubscription]>();

jest.mock('@calcom/embed-react', () => ({
  __esModule: true,
  default: () => null,
  getCalApi: () => Promise.resolve(mockCalApi),
}));

jest.mock('@/onboarding/components/BookCallEmbed', () => ({
  BookCallEmbed: ({ date }: { date?: string }) => (
    <div data-testid="book-call-embed">{date ?? 'No date'}</div>
  ),
}));

const mockFetchCalSlots = jest.fn<Promise<Record<string, CalSlot[]>>, []>();

jest.mock('@/getting-started/utils/fetchCalSlots', () => ({
  fetchCalSlots: () => mockFetchCalSlots(),
}));

const mockUpdateGettingStarted = jest.fn();

jest.mock('@/getting-started/hooks/useUpdateGettingStarted', () => ({
  useUpdateGettingStarted: () => ({
    updateGettingStarted: mockUpdateGettingStarted,
    isSaving: false,
  }),
}));

dynamicActivate(SOURCE_LOCALE);

const tomorrow = Temporal.Now.plainDateISO(detectTimeZone()).add({ days: 1 });

const renderAction = async (calendarBookingPageId: string | null) => {
  jotaiStore.set(calendarBookingPageIdState.atom, calendarBookingPageId);

  render(
    <MemoryRouter>
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <GettingStartedBookCallAction />
        </I18nProvider>
      </JotaiProvider>
    </MemoryRouter>,
  );

  await act(async () => {
    await Promise.resolve();
  });
};

const emitBookingSuccessful = () =>
  mockCalApi.mock.calls
    .filter(([method]) => method === 'on')
    .at(-1)?.[1]
    .callback();

describe('GettingStartedBookCallAction', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
    mockFetchCalSlots.mockResolvedValue({
      [tomorrow.toString()]: [
        {
          start: `${tomorrow.toString()}T09:00:00Z`,
          end: `${tomorrow.toString()}T09:15:00Z`,
        },
      ],
    });
  });

  it('should open the booking page on the day picked in the calendar', async () => {
    await renderAction('team/twenty/talk-to-us');

    expect(await screen.findByText('15 min')).toBeInTheDocument();
    expect(screen.queryByTestId('book-call-embed')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: format(
          new Date(tomorrow.year, tomorrow.month - 1, tomorrow.day),
          'EEEE, MMMM d',
        ),
      }),
    );

    expect(screen.getByTestId('book-call-embed')).toHaveTextContent(
      tomorrow.toString(),
    );
  });

  it('should complete the step and close the booking page when a booking succeeds', async () => {
    await renderAction('team/twenty/talk-to-us');

    await userEvent.click(screen.getByRole('button', { name: 'Pick a time' }));

    expect(screen.getByTestId('book-call-embed')).toHaveTextContent('No date');

    await act(async () => {
      await Promise.resolve();
      emitBookingSuccessful();
    });

    expect(mockUpdateGettingStarted).toHaveBeenCalledWith({
      completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
    });
    expect(screen.queryByTestId('book-call-embed')).not.toBeInTheDocument();
  });

  it('should still offer the booking page when the availability fails to load', async () => {
    mockFetchCalSlots.mockRejectedValue(new Error('Network error'));

    await renderAction('team/twenty/talk-to-us');

    expect(
      await screen.findByText('Pick a time that suits you'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick a time' })).toBeEnabled();
  });

  it('should render nothing without a booking page', async () => {
    await renderAction(null);

    expect(
      screen.queryByRole('button', { name: 'Pick a time' }),
    ).not.toBeInTheDocument();
  });
});
