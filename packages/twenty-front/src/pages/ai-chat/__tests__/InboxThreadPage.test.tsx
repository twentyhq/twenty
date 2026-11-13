import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueInboxInSidePanelState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { InboxThreadPage } from '~/pages/ai-chat/InboxThreadPage';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/components/InboxTab', () => {
  const { useContext } = jest.requireActual('react');
  const { InboxSurfaceContext } = jest.requireActual(
    '@/ai/contexts/InboxSurfaceContext',
  );
  return {
    InboxTab: () => (
      <div data-testid="ai-chat-tab">{useContext(InboxSurfaceContext)}</div>
    ),
  };
});

jest.mock('@/ai/components/InboxThreadPageHeader', () => ({
  InboxThreadPageHeader: () => <div>Chat header</div>,
}));

jest.mock('@/ai/components/InboxThreadPageThreadUrlSyncEffect', () => ({
  InboxThreadPageThreadUrlSyncEffect: () => null,
}));

jest.mock('@/ai/components/InboxThreadPageCloseSidePanelChatEffect', () => ({
  InboxThreadPageCloseSidePanelChatEffect: () => null,
}));

let mockIsMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

jest.mock('@/ai/components/InboxCloseButton', () => ({
  InboxCloseButton: () => <button>Close chat</button>,
}));

jest.mock('@/information-banner/components/InformationBannerWrapper', () => ({
  InformationBannerWrapper: () => null,
}));

jest.mock('~/pages/object-record/RecordShowPageContent', () => ({
  RecordShowPageContent: ({
    parameters,
    headerActions,
    headerTitleMode,
    isRecordIdentifierBarHidden,
  }: {
    parameters: { objectNameSingular: string; objectRecordId: string };
    headerActions?: ReactNode;
    headerTitleMode?: string;
    isRecordIdentifierBarHidden?: boolean;
  }) => (
    <div>
      Record page {parameters.objectNameSingular} {parameters.objectRecordId}
      {headerTitleMode === 'record-title' && <span>Title-only header</span>}
      {isRecordIdentifierBarHidden === true && <span>No identifier bar</span>}
      {headerActions}
    </div>
  ),
}));

const THREAD_ID = '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';

const renderAt = (path: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={AppPath.AiChat} element={<InboxThreadPage />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('InboxThreadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsMobile = false;
    sessionStorage.clear();
    resetJotaiStore();
  });

  it.each([true, false])(
    'renders a new chat on its own page with onboarding set to %s',
    (isOnboarding) => {
      jotaiStore.set(shouldOpenInboxAfterOnboardingState.atom, isOnboarding);
      const { getByText, getByTestId, queryByText } = renderAt('/chat');

      expect(getByText('Chat header')).toBeInTheDocument();
      expect(getByTestId('ai-chat-tab')).toHaveTextContent('page');
      expect(queryByText(/Record page/)).toBeNull();
    },
  );

  it('renders the current chat as its record page when the URL has no chat', () => {
    jotaiStore.set(currentInboxThreadState.atom, THREAD_ID);

    const { getByText } = renderAt('/chat');

    expect(
      getByText(`Record page agentChatThread ${THREAD_ID}`),
    ).toBeInTheDocument();
  });

  it('renders a saved chat as its record page', () => {
    const { getByText, queryByText } = renderAt(`/chat/${THREAD_ID}`);

    expect(
      getByText(`Record page agentChatThread ${THREAD_ID}`),
    ).toBeInTheDocument();
    expect(queryByText('Chat header')).toBeNull();
  });

  it('shows a saved chat with its title as the only header', () => {
    const { getByText } = renderAt(`/chat/${THREAD_ID}`);

    expect(getByText('Title-only header')).toBeInTheDocument();
    expect(getByText('No identifier bar')).toBeInTheDocument();
  });

  it('keeps the close button of a saved chat on mobile', () => {
    mockIsMobile = true;

    const { getByRole } = renderAt(`/chat/${THREAD_ID}`);

    expect(getByRole('button', { name: 'Close chat' })).toBeInTheDocument();
  });

  it('should mark the chat for side panel continuation while mounted', () => {
    const { unmount } = renderAt('/chat');

    expect(jotaiStore.get(shouldContinueInboxInSidePanelState.atom)).toBe(true);

    unmount();

    expect(jotaiStore.get(shouldContinueInboxInSidePanelState.atom)).toBe(
      false,
    );
  });
});
