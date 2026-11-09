import { act, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallAction } from '@/getting-started/components/GettingStartedBookCallAction';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const mockCalApi = jest.fn();

jest.mock('@calcom/embed-react', () => ({
  __esModule: true,
  default: () => <div>Booking calendar</div>,
  getCalApi: () => Promise.resolve(mockCalApi),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUpdateGettingStarted = jest.fn();

jest.mock('@/getting-started/hooks/useUpdateGettingStarted', () => ({
  useUpdateGettingStarted: () => ({
    updateGettingStarted: mockUpdateGettingStarted,
    isSaving: false,
  }),
}));

const renderAction = async (calendarBookingPageId: string | null) => {
  jotaiStore.set(calendarBookingPageIdState.atom, calendarBookingPageId);

  render(
    <JotaiProvider store={jotaiStore}>
      <GettingStartedBookCallAction />
    </JotaiProvider>,
  );

  await act(async () => {
    await Promise.resolve();
  });
};

const emitBookingSuccessful = () => {
  const [, subscription] =
    mockCalApi.mock.calls.filter(([action]) => action === 'on').at(-1) ?? [];

  (subscription as { callback: () => void }).callback();
};

describe('GettingStartedBookCallAction', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should complete the book call step when a booking succeeds', async () => {
    await renderAction('team/twenty/talk-to-us');

    expect(screen.getByText('Booking calendar')).toBeInTheDocument();

    await act(async () => {
      emitBookingSuccessful();
    });

    expect(mockUpdateGettingStarted).toHaveBeenCalledWith({
      completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
    });
  });

  it('should not show the calendar without a booking page', async () => {
    await renderAction(null);

    expect(screen.queryByText('Booking calendar')).not.toBeInTheDocument();
  });
});
