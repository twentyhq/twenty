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
  const { AiChatMessageListPreambleContext } = jest.requireActual(
    '@/ai/contexts/AiChatMessageListPreambleContext',
  );
  return {
    AiChatTab: () => (
      <div data-testid="ai-chat-tab">
        {useContext(AiChatMessageListPreambleContext)}
      </div>
    ),
  };
});

const headerMock = jest.fn();

jest.mock('@/ai/components/AiChatPageHeader', () => ({
  AiChatPageHeader: ({ isOnboarding }: { isOnboarding: boolean }) => {
    headerMock(isOnboarding);
    return null;
  },
}));

jest.mock('@/ai/components/AiChatPageThreadUrlSyncEffect', () => ({
  AiChatPageThreadUrlSyncEffect: () => null,
}));

jest.mock('@/ai/components/AiChatPageCloseAskAiPanelEffect', () => ({
  AiChatPageCloseAskAiPanelEffect: () => null,
}));

jest.mock('@/onboarding/components/WorkspaceSetupChatPreamble', () => ({
  WorkspaceSetupChatPreamble: () => <div data-testid="preamble" />,
}));

jest.mock(
  '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect',
  () => ({
    WorkspaceSetupChatKickoffEffect: () => (
      <div data-testid="chat-kickoff-effect" />
    ),
  }),
);

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

  it('should dress the chat for onboarding when the post-onboarding hint is set', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    const { getByTestId } = render(<AiChatPage />, { wrapper: Wrapper });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(getByTestId('chat-kickoff-effect')).toBeInTheDocument();
    expect(headerMock).toHaveBeenCalledWith(true);
  });

  it('should render a plain chat when the post-onboarding hint is not set', () => {
    const { getByTestId, queryByTestId } = render(<AiChatPage />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(queryByTestId('preamble')).not.toBeInTheDocument();
    expect(queryByTestId('chat-kickoff-effect')).not.toBeInTheDocument();
    expect(headerMock).toHaveBeenCalledWith(false);
  });

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
