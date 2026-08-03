import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { BookCallOnboardingStepActions } from '@/onboarding/components/BookCallOnboardingStepActions';

const mockCompleteBookCallOnboardingStep = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();
const mockCalApi = jest.fn();

jest.mock('@calcom/embed-react', () => ({
  getCalApi: () => Promise.resolve(mockCalApi),
}));

jest.mock('@/onboarding/hooks/useCompleteBookCallOnboardingStep', () => ({
  useCompleteBookCallOnboardingStep: () => mockCompleteBookCallOnboardingStep,
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

dynamicActivate(SOURCE_LOCALE);

const getSubscriptionCalls = () =>
  mockCalApi.mock.calls.filter(([action]) => action === 'on');

const emitBookingSuccessful = () => {
  const [, subscription] = getSubscriptionCalls().at(-1) ?? [];

  (subscription as { callback: () => void }).callback();
};

const renderActions = async () => {
  const view = render(
    <I18nProvider i18n={i18n}>
      <BookCallOnboardingStepActions />
    </I18nProvider>,
  );

  await act(async () => {
    await Promise.resolve();
  });

  return { view, skipButton: screen.getByRole('button') };
};

describe('BookCallOnboardingStepActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompleteBookCallOnboardingStep.mockResolvedValue(undefined);
  });

  it('should complete the step when a booking succeeds', async () => {
    await renderActions();

    await act(async () => {
      emitBookingSuccessful();
    });

    expect(mockCompleteBookCallOnboardingStep).toHaveBeenCalledTimes(1);
  });

  it('should complete the step when skipping', async () => {
    const { skipButton } = await renderActions();

    await act(async () => {
      skipButton.click();
    });

    expect(mockCompleteBookCallOnboardingStep).toHaveBeenCalledTimes(1);
  });

  it('should disable skipping while the booking completion is in flight', async () => {
    let resolveCompletion: () => void = () => {};

    mockCompleteBookCallOnboardingStep.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveCompletion = resolve;
      }),
    );

    const { skipButton } = await renderActions();

    expect(skipButton).not.toBeDisabled();

    act(() => {
      emitBookingSuccessful();
    });

    expect(skipButton).toBeDisabled();

    await act(async () => {
      resolveCompletion();
    });
  });

  it('should re-enable skipping and report the failure when the completion fails', async () => {
    mockCompleteBookCallOnboardingStep.mockRejectedValueOnce(
      new Error('network error'),
    );

    const { skipButton } = await renderActions();

    await act(async () => {
      emitBookingSuccessful();
    });

    expect(skipButton).not.toBeDisabled();
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalled();
  });

  it('should complete the step once even when the embed emits repeatedly', async () => {
    mockCompleteBookCallOnboardingStep.mockRejectedValue(
      new Error('network error'),
    );

    await renderActions();

    await act(async () => {
      emitBookingSuccessful();
    });
    await act(async () => {
      emitBookingSuccessful();
    });

    expect(mockCompleteBookCallOnboardingStep).toHaveBeenCalledTimes(1);
  });

  it('should subscribe to the embed once across re-renders', async () => {
    const { view } = await renderActions();

    await act(async () => {
      emitBookingSuccessful();
    });

    view.rerender(
      <I18nProvider i18n={i18n}>
        <BookCallOnboardingStepActions />
      </I18nProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getSubscriptionCalls()).toHaveLength(1);
    expect(mockCalApi).not.toHaveBeenCalledWith('off', expect.anything());
  });
});
