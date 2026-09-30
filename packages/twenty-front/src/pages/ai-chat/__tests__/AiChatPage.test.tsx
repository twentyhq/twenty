import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { AiChatPage } from '~/pages/ai-chat/AiChatPage';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/components/AiChatTab', () => {
  const { useContext } = jest.requireActual('react');
  const { AiChatSurfaceContext } = jest.requireActual(
    '@/ai/contexts/AiChatSurfaceContext',
  );
  return {
    AiChatTab: () => (
      <div data-testid="ai-chat-tab">{useContext(AiChatSurfaceContext)}</div>
    ),
  };
});

jest.mock('@/ai/components/AiChatPageHeader', () => ({
  AiChatPageHeader: () => <div>Chat header</div>,
}));

jest.mock('@/ai/components/AiChatPageThreadUrlSyncEffect', () => ({
  AiChatPageThreadUrlSyncEffect: () => null,
}));

jest.mock('@/ai/components/AiChatPageCloseSidePanelChatEffect', () => ({
  AiChatPageCloseSidePanelChatEffect: () => null,
}));

let mockIsMobile = false;
let mockHasChatLayout = true;
let mockHasChatObject = true;

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: (
      _selector: unknown,
      parameters: Record<string, unknown>,
    ) =>
      'objectMetadataId' in parameters
        ? mockHasChatLayout && parameters.objectMetadataId
          ? { id: 'chat-layout-id' }
          : undefined
        : mockHasChatObject
          ? { id: 'chat-object-id' }
          : null,
  }),
);

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

jest.mock('@/ai/components/AiChatCloseButton', () => ({
  AiChatCloseButton: () => <button>Close chat</button>,
}));

jest.mock('@/information-banner/components/InformationBannerWrapper', () => ({
  InformationBannerWrapper: () => null,
}));

jest.mock('~/pages/object-record/RecordShowPage', () => ({
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
            <Route path={AppPath.AiChat} element={<AiChatPage />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );

describe('AiChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsMobile = false;
    mockHasChatLayout = true;
    mockHasChatObject = true;
    sessionStorage.clear();
    resetJotaiStore();
  });

  it.each([true, false])(
    'renders a new chat on its own page with onboarding set to %s',
    (isOnboarding) => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, isOnboarding);
      const { getByText, getByTestId, queryByText } = renderAt('/chat');

      expect(getByText('Chat header')).toBeInTheDocument();
      expect(getByTestId('ai-chat-tab')).toHaveTextContent('page');
      expect(queryByText(/Record page/)).toBeNull();
    },
  );

  it.each(['object', 'layout'])(
    'keeps a saved chat usable without its %s metadata',
    (missingMetadata) => {
      mockHasChatObject = missingMetadata !== 'object';
      mockHasChatLayout = missingMetadata !== 'layout';
      jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);

      const { getByTestId, queryByText } = renderAt(`/chat/${THREAD_ID}`);

      expect(getByTestId('ai-chat-tab')).toHaveTextContent('page');
      expect(queryByText(/Record page/)).toBeNull();
    },
  );

  it('renders the current chat as its record page when the URL has no chat', () => {
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);

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

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );

    unmount();

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
  });
});
