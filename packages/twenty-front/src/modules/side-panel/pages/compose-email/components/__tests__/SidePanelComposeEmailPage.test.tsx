import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SidePanelComposeEmailPage } from '@/side-panel/pages/compose-email/components/SidePanelComposeEmailPage';
import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { composeEmailDefaultInReplyToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultInReplyToComponentState';
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
  handleAliases: null,
  scopes: ['https://www.googleapis.com/auth/gmail.send'],
  connectionParameters: null,
};

const accountDomain = {
  id: 'domain-account',
  handle: 'ops@getindexed.ai',
  provider: ConnectedAccountProvider.GOOGLE,
  handleAliases: null,
  scopes: ['https://www.googleapis.com/auth/gmail.send'],
  connectionParameters: null,
};

const renderPage = (inReplyTo: string | null) => {
  mockStateValues = new Map<unknown, unknown>([
    [composeEmailConnectedAccountIdComponentState, 'thread-account'],
    [composeEmailDefaultInReplyToComponentState, inReplyTo],
  ]);

  const store = createStore();
  store.set(myConnectedAccountsState.atom, [
    accountThread,
    accountDomain,
  ] as never);
  store.set(currentWorkspaceState.atom, {
    defaultSenderDomain: 'getindexed.ai',
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

  it('starts a new email on the workspace domain account', () => {
    renderPage(null);

    expect(mockUseEmailComposerState).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'domain-account',
        initialFromHandle: 'ops@getindexed.ai',
      }),
    );
  });

  it('keeps the thread account for a reply even when another account matches the domain', () => {
    renderPage('<message-id@mail>');

    expect(mockUseEmailComposerState).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'thread-account',
        initialFromHandle: undefined,
      }),
    );
  });
});
