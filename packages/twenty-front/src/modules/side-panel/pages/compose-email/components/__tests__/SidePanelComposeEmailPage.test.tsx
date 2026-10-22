import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { SidePanelComposeEmailPage } from '@/side-panel/pages/compose-email/components/SidePanelComposeEmailPage';
import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { composeEmailDefaultInReplyToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultInReplyToComponentState';
import { composeEmailInitialFromHandleComponentState } from '@/side-panel/pages/compose-email/states/composeEmailInitialFromHandleComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));
jest.mock(
  '@/advanced-text-editor/components/FormAdvancedTextFieldInput',
  () => ({ FormAdvancedTextFieldInput: () => null }),
);
jest.mock(
  '@/activities/emails/recipients/components/EmailRecipientsFieldInput',
  () => ({ EmailRecipientsFieldInput: () => null }),
);
jest.mock('@/activities/emails/hooks/useUploadEmailImage', () => ({
  useUploadEmailImage: () => ({ uploadEmailImage: jest.fn() }),
}));
jest.mock('@/activities/emails/hooks/useAttachEmailFiles', () => ({
  useAttachEmailFiles: () => ({
    openAttachmentPicker: jest.fn(),
    isUploadingAttachments: false,
  }),
}));
jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({ goBackFromSidePanel: jest.fn() }),
}));
jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: () => undefined,
}));

const PAGE_INSTANCE_ID = 'compose-email-page';

const SENDABLE_ACCOUNTS: Omit<
  ConnectedAccount,
  'messageChannels' | 'calendarChannels'
>[] = [
  {
    id: 'domain-account',
    handle: 'ops@example.com',
    handleAliases: [],
  },
  {
    id: 'thread-account',
    handle: 'person@gmail.com',
    handleAliases: ['person@example.com'],
  },
].map((account) => ({
  __typename: 'ConnectedAccount',
  provider: ConnectedAccountProvider.GOOGLE,
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: ['https://www.googleapis.com/auth/gmail.send'],
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-1',
  connectionProviderId: null,
  applicationId: null,
  name: null,
  scope: 'USER',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...account,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <MockedProvider
        mocks={[
          {
            request: { query: GET_MY_CONNECTED_ACCOUNTS },
            result: { data: { myConnectedAccounts: SENDABLE_ACCOUNTS } },
          },
        ]}
      >
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: PAGE_INSTANCE_ID }}
        >
          {children}
        </SidePanelPageComponentInstanceContext.Provider>
      </MockedProvider>
    </I18nProvider>
  </JotaiProvider>
);

const seedSenderSettings = (personalFromHandle: string | null) => {
  jotaiStore.set(myConnectedAccountsState.atom, SENDABLE_ACCOUNTS);
  jotaiStore.set(currentWorkspaceState.atom, {
    defaultSenderDomain: 'example.com',
  } as CurrentWorkspace);
  jotaiStore.set(currentUserWorkspaceState.atom, {
    permissionFlags: [],
    objectsPermissions: [],
    defaultFromHandle: personalFromHandle,
  } as CurrentUserWorkspace);
};

const seedComposeRequest = ({
  connectedAccountId,
  initialFromHandle = null,
  defaultInReplyTo = '',
}: {
  connectedAccountId: string;
  initialFromHandle?: string | null;
  defaultInReplyTo?: string;
}) => {
  const pageInstance = { instanceId: PAGE_INSTANCE_ID };

  jotaiStore.set(
    composeEmailConnectedAccountIdComponentState.atomFamily(pageInstance),
    connectedAccountId,
  );
  jotaiStore.set(
    composeEmailInitialFromHandleComponentState.atomFamily(pageInstance),
    initialFromHandle,
  );
  jotaiStore.set(
    composeEmailDefaultInReplyToComponentState.atomFamily(pageInstance),
    defaultInReplyTo,
  );
};

const renderPage = () =>
  render(<SidePanelComposeEmailPage />, { wrapper: Wrapper });

describe('SidePanelComposeEmailPage', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('starts a new email on the From address it was opened with', async () => {
    seedSenderSettings(null);
    seedComposeRequest({
      connectedAccountId: 'thread-account',
      initialFromHandle: 'person@gmail.com',
    });

    renderPage();

    expect(await screen.findByText('person@gmail.com')).toBeVisible();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.queryByText('person@example.com')).not.toBeInTheDocument();
  });

  it('keeps the requested account when the personal default is on another one', async () => {
    seedSenderSettings('ops@example.com');
    seedComposeRequest({ connectedAccountId: 'thread-account' });

    renderPage();

    expect(await screen.findByText('person@example.com')).toBeVisible();
    expect(screen.queryByText('ops@example.com')).not.toBeInTheDocument();
  });

  it('replies from the thread account on its workspace domain address', async () => {
    seedSenderSettings(null);
    seedComposeRequest({
      connectedAccountId: 'thread-account',
      defaultInReplyTo: '<message-1@example.com>',
    });

    renderPage();

    expect(await screen.findByText('person@example.com')).toBeVisible();
    expect(screen.queryByText('ops@example.com')).not.toBeInTheDocument();
  });

  it('shows no composer when no account was requested', () => {
    seedSenderSettings('ops@example.com');
    seedComposeRequest({ connectedAccountId: '' });

    renderPage();

    expect(screen.queryByText('From')).not.toBeInTheDocument();
  });
});
