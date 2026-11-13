import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { SidePanelConnectApplicationWithApiKeyPage } from '@/side-panel/pages/connect-application-with-api-key/components/SidePanelConnectApplicationWithApiKeyPage';
import { connectApplicationWithApiKeyTargetComponentState } from '@/side-panel/pages/connect-application-with-api-key/states/connectApplicationWithApiKeyTargetComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockConnectApplicationWithApiKey = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockConnectApplicationWithApiKey, { loading: false }],
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({ goBackFromSidePanel: jest.fn() }),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: jest.fn(),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const PAGE_ID = 'connect-page';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_ID }}
      >
        {children}
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

describe('SidePanelConnectApplicationWithApiKeyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(
      connectApplicationWithApiKeyTargetComponentState.atomFamily({
        instanceId: PAGE_ID,
      }),
      {
        applicationId: 'app-1',
        providerName: 'front',
        providerDisplayName: 'Front',
        reconnectingConnectedAccountId: null,
      },
    );
  });

  it('connects with the pasted key and closes the side panel', async () => {
    mockConnectApplicationWithApiKey.mockResolvedValue({
      data: { connectApplicationWithApiKey: 'account-1' },
    });

    render(<SidePanelConnectApplicationWithApiKeyPage />, { wrapper: Wrapper });

    const connectButton = screen.getByRole('button', { name: /Connect/ });

    expect(connectButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText('API key'), 'secret-key');
    await userEvent.click(connectButton);

    expect(mockConnectApplicationWithApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            applicationId: 'app-1',
            providerName: 'front',
            apiKey: 'secret-key',
            reconnectingConnectedAccountId: null,
          },
        },
      }),
    );
    expect(mockCloseSidePanelMenu).toHaveBeenCalled();
  });

  it('keeps the panel open and shows why the key was rejected', async () => {
    mockConnectApplicationWithApiKey.mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'identifyAccount failed',
            extensions: {
              userFriendlyMessage:
                'We could not verify this key. Check it, or try again later if the service is down.',
            },
          },
        ],
      }),
    );

    render(<SidePanelConnectApplicationWithApiKeyPage />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText('API key'), 'wrong-key');
    await userEvent.click(screen.getByRole('button', { name: /Connect/ }));

    expect(
      await screen.findByText(
        'We could not verify this key. Check it, or try again later if the service is down.',
      ),
    ).toBeInTheDocument();
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });
});
