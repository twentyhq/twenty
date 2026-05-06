import { useMutation, useQuery } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsApplicationConnectionDetail } from '~/pages/settings/applications/SettingsApplicationConnectionDetail';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useMyAppConnectedAccounts } from '~/pages/settings/applications/hooks/useMyAppConnectedAccounts';

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
  '~/pages/settings/applications/hooks/useMyAppConnectedAccounts',
  () => ({
    useMyAppConnectedAccounts: jest.fn(),
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

jest.mock('@/ui/layout/page/components/SubMenuTopBarContainer', () => ({
  SubMenuTopBarContainer: ({ children }: { children: ReactNode }) => (
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
const mockedUseMyAppConnectedAccounts =
  useMyAppConnectedAccounts as jest.MockedFunction<
    typeof useMyAppConnectedAccounts
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
          oauth: {
            scopes: ['calendar.readonly'],
            isClientCredentialsConfigured: true,
          },
        },
      ],
      loading: false,
      refetch: jest.fn(),
    });
    mockedUseMyAppConnectedAccounts.mockReturnValue({
      accounts: [
        {
          __typename: 'ConnectedAccountDTO',
          id: 'account-1',
          handle: 'workspace@example.com',
          provider: 'app',
          authFailedAt: null,
          scopes: ['calendar.readonly'],
          handleAliases: [],
          lastSignedInAt: null,
          userWorkspaceId: 'user-workspace-1',
          connectionProviderId: 'provider-1',
          name: 'Original name',
          visibility: 'user',
          lastCredentialsRefreshedAt: null,
          connectionParameters: null,
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
      'change-application-connection-visibility-modal-account-1',
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Reconnect and change visibility',
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
});
