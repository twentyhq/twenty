import { useMutation, useQuery } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsApplicationConnectionDetail } from '~/pages/settings/applications/SettingsApplicationConnectionDetail';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useApplicationConnectedAccounts } from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';

const mockTriggerAppOAuth = jest.fn();
const mockDeleteConnectedAccount = jest.fn();
const mockOpenModal = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock(
  '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders',
  () => ({
    useFindApplicationConnectionProviders: jest.fn(),
  }),
);

jest.mock(
  '~/pages/settings/applications/hooks/useApplicationConnectedAccounts',
  () => ({
    useApplicationConnectedAccounts: jest.fn(),
  }),
);

jest.mock('~/pages/settings/applications/hooks/useTriggerAppOAuth', () => ({
  useTriggerAppOAuth: jest.fn(() => ({
    triggerAppOAuth: mockTriggerAppOAuth,
  })),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: jest.fn(() => jest.fn()),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: jest.fn(() => ({
    openModal: mockOpenModal,
  })),
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: ({
    confirmButtonText,
    onConfirmClick,
  }: {
    confirmButtonText: string;
    onConfirmClick: () => void;
  }) => <button onClick={onConfirmClick}>{confirmButtonText}</button>,
}));

jest.mock('@/settings/components/SettingsPageContainer', () => ({
  SettingsPageContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/settings/components/layout/SettingsPageLayout', () => ({
  SettingsPageLayout: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

const mockedUseMutation = useMutation as jest.MockedFunction<
  typeof useMutation
>;
const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockedUseFindApplicationConnectionProviders =
  useFindApplicationConnectionProviders as jest.MockedFunction<
    typeof useFindApplicationConnectionProviders
  >;
const mockedUseApplicationConnectedAccounts =
  useApplicationConnectedAccounts as jest.MockedFunction<
    typeof useApplicationConnectedAccounts
  >;

const renderDetailPage = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter
        initialEntries={['/settings/applications/app-1/connections/account-1']}
      >
        <Routes>
          <Route
            path="/settings/applications/:applicationId/connections/:connectedAccountId"
            element={<SettingsApplicationConnectionDetail />}
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );

describe('SettingsApplicationConnectionDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseQuery.mockReturnValue({
      data: {
        findOneApplication: {
          id: 'app-1',
          name: 'Calendar app',
        },
      },
      loading: false,
    } as never);
    mockedUseMutation.mockReturnValue([
      mockDeleteConnectedAccount,
      { loading: false },
    ] as never);
    mockedUseFindApplicationConnectionProviders.mockReturnValue({
      connectionProviders: [
        {
          id: 'provider-1',
          applicationId: 'app-1',
          type: 'oauth',
          name: 'google-calendar',
          displayName: 'Google Calendar',
          logoUrl: null,
          oauth: {
            scopes: ['calendar.readonly'],
            isClientCredentialsConfigured: true,
          },
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });
    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts: [
        {
          __typename: 'ApplicationConnectedAccountDTO',
          id: 'account-1',
          handle: 'workspace@example.com',
          authFailedAt: null,
          scopes: ['calendar.readonly'],
          lastSignedInAt: null,
          connectionProviderId: 'provider-1',
          name: 'Original name',
          visibility: 'user',
          lastCredentialsRefreshedAt: null,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });
  });

  it('changes visibility by reconnecting with the opposite visibility', () => {
    renderDetailPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: /Share with workspace/,
      }),
    );

    expect(mockOpenModal).toHaveBeenCalledWith(
      'share-application-connection-with-workspace-modal-account-1',
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Reconnect and share',
      }),
    );

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'workspace',
      reconnectingConnectedAccountId: 'account-1',
      redirectLocation: '/settings/applications/app-1/connections/account-1',
    });
  });

  it('offers reconnect and disconnect on a failed workspace shared connection', () => {
    mockedUseApplicationConnectedAccounts.mockReturnValue({
      accounts: [
        {
          __typename: 'ApplicationConnectedAccountDTO',
          id: 'account-1',
          handle: 'workspace@example.com',
          authFailedAt: '2026-05-01T00:00:00.000Z',
          scopes: ['calendar.readonly'],
          lastSignedInAt: null,
          connectionProviderId: 'provider-1',
          name: 'Shared connection',
          visibility: 'workspace',
          lastCredentialsRefreshedAt: null,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });

    renderDetailPage();

    expect(screen.getByText('Workspace shared')).toBeVisible();
    expect(screen.getByText('Reconnect needed')).toBeVisible();

    fireEvent.click(screen.getByText('Reconnect'));

    expect(mockTriggerAppOAuth).toHaveBeenCalledWith({
      applicationId: 'app-1',
      providerName: 'google-calendar',
      visibility: 'workspace',
      reconnectingConnectedAccountId: 'account-1',
      redirectLocation: '/settings/applications/app-1/connections/account-1',
    });

    // The mocked confirmation modal also renders "Disconnect", so pick the
    // action, which comes first in the document.
    const [disconnectAction] = screen.getAllByText('Disconnect');

    fireEvent.click(disconnectAction);

    expect(mockOpenModal).toHaveBeenCalledWith(
      'delete-application-connection-modal-account-1',
    );
  });
});
