import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY } from '@/onboarding/constants/OnboardingBookCallPendingUserVarKey';
import { PrefetchBookCallStepEffect } from '@/onboarding/effect-components/PrefetchBookCallStepEffect';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockCalApi = jest.fn();

jest.mock('@calcom/embed-react', () => ({
  getCalApi: () => Promise.resolve(mockCalApi),
}));

const renderEffect = async ({
  isBookCallOnboardingStepEnabled,
  isBookCallOnboardingStepPending,
  calendarBookingPageId,
}: {
  isBookCallOnboardingStepEnabled: boolean;
  isBookCallOnboardingStepPending: boolean;
  calendarBookingPageId: string | null;
}) => {
  jotaiStore.set(
    isBookCallOnboardingStepEnabledState.atom,
    isBookCallOnboardingStepEnabled,
  );
  jotaiStore.set(calendarBookingPageIdState.atom, calendarBookingPageId);
  jotaiStore.set(currentUserState.atom, {
    id: 'user-id',
    userVars: {
      [ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY]:
        isBookCallOnboardingStepPending,
    },
  } as never);

  render(
    <JotaiProvider store={jotaiStore}>
      <PrefetchBookCallStepEffect />
    </JotaiProvider>,
  );

  await act(async () => {
    await Promise.resolve();
  });
};

const getPreloadCalls = () =>
  mockCalApi.mock.calls.filter(([action]) => action === 'preload');

describe('PrefetchBookCallStepEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should warm the booking page when the step is pending and configured', async () => {
    await renderEffect({
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: true,
      calendarBookingPageId: 'team/twenty/talk-to-us',
    });

    expect(getPreloadCalls()).toEqual([
      ['preload', { calLink: 'team/twenty/talk-to-us' }],
    ]);
  });

  it('should not warm anything when the user is not pending the step', async () => {
    await renderEffect({
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: false,
      calendarBookingPageId: 'team/twenty/talk-to-us',
    });

    expect(getPreloadCalls()).toHaveLength(0);
  });

  it('should not warm anything when the step is disabled', async () => {
    await renderEffect({
      isBookCallOnboardingStepEnabled: false,
      isBookCallOnboardingStepPending: true,
      calendarBookingPageId: 'team/twenty/talk-to-us',
    });

    expect(getPreloadCalls()).toHaveLength(0);
  });

  it('should not warm anything without a booking page', async () => {
    await renderEffect({
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: true,
      calendarBookingPageId: null,
    });

    expect(getPreloadCalls()).toHaveLength(0);
  });
});
