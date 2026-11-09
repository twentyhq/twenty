import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallAction } from '@/getting-started/components/GettingStartedBookCallAction';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const mockUpdateGettingStarted = jest.fn();

jest.mock('@/getting-started/hooks/useUpdateGettingStarted', () => ({
  useUpdateGettingStarted: () => ({
    updateGettingStarted: mockUpdateGettingStarted,
    isSaving: false,
  }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

dynamicActivate(SOURCE_LOCALE);

const SLOTS_RESPONSE = {
  status: 'success',
  data: {
    '2026-11-10': [
      {
        start: '2026-11-10T10:45:00.000+01:00',
        end: '2026-11-10T11:00:00.000+01:00',
      },
    ],
    '2026-11-09': [
      {
        start: '2026-11-09T09:30:00.000+01:00',
        end: '2026-11-09T09:45:00.000+01:00',
      },
    ],
  },
};

const mockFetch = jest.fn();

const jsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({
    ok,
    status: ok ? 200 : 400,
    json: () => Promise.resolve(body),
  });

const renderAction = (calendarBookingPageId: string | null) => {
  jotaiStore.set(calendarBookingPageIdState.atom, calendarBookingPageId);
  jotaiStore.set(currentUserState.atom, {
    id: 'user-id',
    email: 'tim@apple.dev',
    firstName: 'Tim',
    lastName: 'Apple',
  } as never);
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    id: 'workspace-member-id',
    name: { firstName: 'Tim', lastName: 'Apple' },
    timeZone: 'Europe/Paris',
  } as never);
  jotaiStore.set(workspaceMemberFormatPreferencesState.atom, {
    ...jotaiStore.get(workspaceMemberFormatPreferencesState.atom),
    timeFormat: TimeFormat.HOUR_24,
  });

  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <GettingStartedBookCallAction />
      </I18nProvider>
    </JotaiProvider>,
  );
};

const getBookingRequestBody = () => {
  const [, init] =
    mockFetch.mock.calls.find(([url]) => String(url).endsWith('/bookings')) ??
    [];

  return JSON.parse((init as RequestInit).body as string);
};

describe('GettingStartedBookCallAction', () => {
  beforeAll(() => {
    jest.useFakeTimers({
      now: new Date('2026-11-08T10:00:00.000Z'),
      doNotFake: [
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
    global.fetch = mockFetch;
    mockFetch.mockImplementation((url: string) =>
      url.endsWith('/bookings')
        ? jsonResponse({ status: 'success' })
        : jsonResponse(SLOTS_RESPONSE),
    );
  });

  it('should request the picked time and complete the step', async () => {
    renderAction('team/twenty/talk-to-us');

    await userEvent.click(
      await screen.findByRole('button', { name: 'Tuesday, November 10' }),
    );
    await userEvent.click(screen.getByRole('button', { name: '10:45' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'What is this meeting about?*' }),
      'Migrating from HubSpot',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Request call' }));

    await waitFor(() =>
      expect(mockUpdateGettingStarted).toHaveBeenCalledWith({
        completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
      }),
    );
    expect(getBookingRequestBody()).toEqual({
      teamSlug: 'twenty',
      eventTypeSlug: 'talk-to-us',
      start: '2026-11-10T09:45:00.000Z',
      attendee: {
        name: 'Tim Apple',
        email: 'tim@apple.dev',
        timeZone: 'Europe/Paris',
      },
      bookingFieldsResponses: { title: 'Migrating from HubSpot' },
    });
  });

  it('should keep the step open and report a failed booking', async () => {
    mockFetch.mockImplementation((url: string) =>
      url.endsWith('/bookings')
        ? jsonResponse({ status: 'error' }, false)
        : jsonResponse(SLOTS_RESPONSE),
    );
    renderAction('team/twenty/talk-to-us');

    await userEvent.click(await screen.findByRole('button', { name: '09:30' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'What is this meeting about?*' }),
      'Onboarding',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Request call' }));

    await waitFor(() =>
      expect(mockEnqueueToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error' }),
      ),
    );
    expect(mockUpdateGettingStarted).not.toHaveBeenCalled();
  });

  it('should load the times again after a failure', async () => {
    mockFetch.mockImplementationOnce(() => jsonResponse({}, false));
    renderAction('team/twenty/talk-to-us');

    expect(
      await screen.findByText("We couldn't load the available times."),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('button', { name: '09:30' }),
    ).toBeInTheDocument();
  });

  it('should not offer a call without a booking page', () => {
    renderAction(null);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
