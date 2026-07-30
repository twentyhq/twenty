import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { BookCallOnboardingStepActions } from '@/onboarding/components/BookCallOnboardingStepActions';

const mockCompleteBookCallOnboardingStep = jest.fn();
const mockOnBookingSuccessful = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock(
  '@/onboarding/effect-components/BookCallBookingSuccessEffect',
  () => ({
    BookCallBookingSuccessEffect: ({
      onBookingSuccessful,
    }: {
      onBookingSuccessful: () => void;
    }) => {
      mockOnBookingSuccessful.mockImplementation(onBookingSuccessful);

      return null;
    },
  }),
);

jest.mock('@/onboarding/hooks/useCompleteBookCallOnboardingStep', () => ({
  useCompleteBookCallOnboardingStep: () => mockCompleteBookCallOnboardingStep,
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

dynamicActivate(SOURCE_LOCALE);

const renderActions = () => {
  render(
    <I18nProvider i18n={i18n}>
      <BookCallOnboardingStepActions />
    </I18nProvider>,
  );

  return { skipButton: screen.getByRole('button') };
};

describe('BookCallOnboardingStepActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompleteBookCallOnboardingStep.mockResolvedValue(undefined);
  });

  it('should complete the step when a booking succeeds', async () => {
    renderActions();

    await act(async () => {
      mockOnBookingSuccessful();
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

    const { skipButton } = renderActions();

    expect(skipButton).not.toBeDisabled();

    act(() => {
      mockOnBookingSuccessful();
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

    const { skipButton } = renderActions();

    await act(async () => {
      mockOnBookingSuccessful();
    });

    expect(skipButton).not.toBeDisabled();
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalled();
  });

  it('should complete the step once when skipping right after a booking succeeded', async () => {
    const { skipButton } = renderActions();

    await act(async () => {
      mockOnBookingSuccessful();
    });

    await act(async () => {
      skipButton.click();
    });

    expect(mockCompleteBookCallOnboardingStep).toHaveBeenCalledTimes(1);
  });
});
