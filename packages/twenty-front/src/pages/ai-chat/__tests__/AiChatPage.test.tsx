import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

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

jest.mock('@/ai/components/AiChatPageCloseAskAiPanelEffect', () => ({
  AiChatPageCloseAskAiPanelEffect: () => null,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

describe('AiChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
  });

  it.each([true, false])(
    'renders the shared header and page chat with onboarding set to %s',
    (isOnboarding) => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, isOnboarding);
      const { getByText, getByTestId } = render(<AiChatPage />, {
        wrapper: Wrapper,
      });

      expect(getByText('Chat header')).toBeInTheDocument();
      expect(getByTestId('ai-chat-tab')).toHaveTextContent('page');
    },
  );

  it('should mark the chat for side panel continuation while mounted', () => {
    const { unmount } = render(<AiChatPage />, { wrapper: Wrapper });

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );

    unmount();

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
  });
});
