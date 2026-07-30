import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { BookCallOnboardingStepActions } from '@/onboarding/components/BookCallOnboardingStepActions';

const mockCompleteBookCallOnboardingStep = jest.fn();
const mockCalApi = jest.fn();

jest.mock('@calcom/embed-react', () => ({
  getCalApi: () => Promise.resolve(mockCalApi),
}));

jest.mock('@/onboarding/hooks/useCompleteBookCallOnboardingStep', () => ({
  useCompleteBookCallOnboardingStep: () => mockCompleteBookCallOnboardingStep,
}));

dynamicActivate(SOURCE_LOCALE);

const renderActions = async () => {
  render(
    <I18nProvider i18n={i18n}>
      <BookCallOnboardingStepActions />
    </I18nProvider>,
  );

  // Lets the async getCalApi subscription land before the event is emitted.
  await act(async () => {
    await Promise.resolve();
  });

  const subscription = mockCalApi.mock.calls.find(
    ([action]) => action === 'on',
  );

  return {
    emitBookingSuccessful: subscription?.[1].callback as () => void,
    skipButton: screen.getByRole('button'),
  };
};

describe('BookCallOnboardingStepActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompleteBookCallOnboardingStep.mockResolvedValue(undefined);
  });

  it('should subscribe to the booking success event', async () => {
    const { emitBookingSuccessful } = await renderActions();

    expect(emitBookingSuccessful).toBeDefined();
  });

  // The Cal.com embed can emit the event more than once for a single booking.
  it('should complete the step only once when the event fires repeatedly', async () => {
    const { emitBookingSuccessful } = await renderActions();

    await act(async () => {
      emitBookingSuccessful();
      emitBookingSuccessful();
    });

    expect(mockCompleteBookCallOnboardingStep).toHaveBeenCalledTimes(1);
  });

  // Otherwise a click landing on Skip just after a booking would advance twice.
  it('should disable skipping while the booking completion is in flight', async () => {
    let resolveCompletion: () => void = () => {};

    mockCompleteBookCallOnboardingStep.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveCompletion = resolve;
      }),
    );

    const { emitBookingSuccessful, skipButton } = await renderActions();

    expect(skipButton).not.toBeDisabled();

    act(() => {
      emitBookingSuccessful();
    });

    expect(skipButton).toBeDisabled();

    await act(async () => {
      resolveCompletion();
    });
  });

  it('should allow another attempt when the completion fails', async () => {
    mockCompleteBookCallOnboardingStep.mockRejectedValueOnce(
      new Error('network error'),
    );

    const { emitBookingSuccessful, skipButton } = await renderActions();

    await act(async () => {
      emitBookingSuccessful();
    });

    expect(skipButton).not.toBeDisabled();

    await act(async () => {
      emitBookingSuccessful();
    });

    expect(mockCompleteBookCallOnboardingStep).toHaveBeenCalledTimes(2);
  });
});
