import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { ConnectSlack } from '~/pages/onboarding/ConnectSlack';

const mockUseQuery = jest.fn();
const mockStartConnectSlack = jest.fn();
const mockSkipConnectSlackOnboardingStep = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useQuery: () => mockUseQuery(),
}));

jest.mock('@/onboarding/hooks/useStartConnectSlackOnboardingStep', () => ({
  useStartConnectSlackOnboardingStep: () => ({
    startConnectSlack: mockStartConnectSlack,
    isStarting: false,
  }),
}));

jest.mock('@/onboarding/hooks/useSkipConnectSlackOnboardingStep', () => ({
  useSkipConnectSlackOnboardingStep: () => mockSkipConnectSlackOnboardingStep,
}));

dynamicActivate(SOURCE_LOCALE);

const renderPage = () =>
  render(
    <I18nProvider i18n={i18n}>
      <ConnectSlack />
    </I18nProvider>,
  );

describe('ConnectSlack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSkipConnectSlackOnboardingStep.mockResolvedValue(undefined);
  });

  it('should render the connect call to action when Slack is available', () => {
    mockUseQuery.mockReturnValue({
      data: { isConnectSlackOnboardingStepAvailable: true },
      loading: false,
      error: undefined,
    });

    renderPage();

    expect(screen.getByText('Add to Slack')).toBeInTheDocument();
    expect(mockSkipConnectSlackOnboardingStep).not.toHaveBeenCalled();
  });

  it('should skip the step when Slack cannot be connected on this instance', async () => {
    mockUseQuery.mockReturnValue({
      data: { isConnectSlackOnboardingStepAvailable: false },
      loading: false,
      error: undefined,
    });

    renderPage();

    await waitFor(() => {
      expect(mockSkipConnectSlackOnboardingStep).toHaveBeenCalledWith({
        isAutoSkipped: true,
      });
    });
    expect(screen.queryByText('Add to Slack')).not.toBeInTheDocument();
  });

  it('should render the step when the automatic skip fails', async () => {
    mockUseQuery.mockReturnValue({
      data: { isConnectSlackOnboardingStepAvailable: false },
      loading: false,
      error: undefined,
    });
    mockSkipConnectSlackOnboardingStep.mockRejectedValue(new Error('failed'));

    renderPage();

    expect(await screen.findByText('Add to Slack')).toBeInTheDocument();
  });
});
