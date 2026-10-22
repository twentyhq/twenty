import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SidePanelComposeEmailPage } from '@/side-panel/pages/compose-email/components/SidePanelComposeEmailPage';
import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { composeEmailInitialFromHandleComponentState } from '@/side-panel/pages/compose-email/states/composeEmailInitialFromHandleComponentState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const mockUseEmailComposerState = jest.fn();

let mockStateValues: Map<unknown, unknown>;

jest.mock('@/activities/emails/hooks/useEmailComposerState', () => ({
  useEmailComposerState: (args: unknown) => {
    mockUseEmailComposerState(args);
    return { canSend: false, handleSend: jest.fn(), setFiles: jest.fn() };
  },
}));
jest.mock('@/activities/emails/hooks/useAttachEmailFiles', () => ({
  useAttachEmailFiles: () => ({
    openAttachmentPicker: jest.fn(),
    isUploadingAttachments: false,
  }),
}));
jest.mock('@/activities/emails/components/EmailComposerFields', () => ({
  EmailComposerFields: () => null,
}));
jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({ goBackFromSidePanel: jest.fn() }),
}));
jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: jest.fn(),
}));
jest.mock('@/ui/layout/side-panel/components/SidePanelFooter', () => ({
  SidePanelFooter: () => null,
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) =>
      mockStateValues.get(state) ?? null,
  }),
);

const accountThread = {
  id: 'thread-account',
  handle: 'person@gmail.com',
  provider: ConnectedAccountProvider.GOOGLE,
  handleAliases: ['person@example.com'],
  scopes: ['https://www.googleapis.com/auth/gmail.send'],
  connectionParameters: null,
};

const accountDomain = {
  id: 'domain-account',
  handle: 'ops@example.com',
  provider: ConnectedAccountProvider.GOOGLE,
  handleAliases: null,
  scopes: ['https://www.googleapis.com/auth/gmail.send'],
  connectionParameters: null,
};

const renderPage = ({
  connectedAccountId = 'thread-account',
  initialFromHandle = null,
}: {
  connectedAccountId?: string | null;
  initialFromHandle?: string | null;
} = {}) => {
  mockStateValues = new Map<unknown, unknown>([
    [composeEmailConnectedAccountIdComponentState, connectedAccountId],
    [composeEmailInitialFromHandleComponentState, initialFromHandle],
  ]);

  const store = createStore();
  store.set(myConnectedAccountsState.atom, [
    accountDomain,
    accountThread,
  ] as never);
  store.set(currentWorkspaceState.atom, {
    defaultSenderDomain: 'example.com',
  } as never);
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [],
    objectsPermissions: [],
    defaultFromHandle: null,
  } as never);

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <SidePanelComposeEmailPage />
      </I18nProvider>
    </Provider>,
  );
};

describe('SidePanelComposeEmailPage', () => {
  beforeEach(() => {
    mockUseEmailComposerState.mockReset();
  });

  it('starts a new email on the requested sender', () => {
    renderPage({
      connectedAccountId: 'domain-account',
      initialFromHandle: 'ops@example.com',
    });

    expect(mockUseEmailComposerState).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'domain-account',
        initialFromHandle: 'ops@example.com',
      }),
    );
  });

  it('keeps the requested or thread account and starts on its default handle', () => {
    renderPage();

    expect(mockUseEmailComposerState).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'thread-account',
        initialFromHandle: 'person@example.com',
      }),
    );
  });

  it('does not pick another account when none was requested', () => {
    renderPage({ connectedAccountId: null });

    expect(mockUseEmailComposerState).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: '',
        initialFromHandle: undefined,
      }),
    );
  });
});
