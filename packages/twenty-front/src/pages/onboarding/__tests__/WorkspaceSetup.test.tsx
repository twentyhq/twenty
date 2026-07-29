import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { WorkspaceSetup } from '~/pages/onboarding/WorkspaceSetup';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const defaultHomePagePath = '/objects/companies';

jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath }),
}));

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

jest.mock('@/onboarding/components/WorkspaceSetupHeader', () => ({
  WorkspaceSetupHeader: ({ title }: { title: string }) => (
    <div data-testid="header-title">{title}</div>
  ),
}));

jest.mock('@/onboarding/components/WorkspaceSetupChatPreamble', () => ({
  WorkspaceSetupChatPreamble: () => <div data-testid="preamble" />,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Navigate: (props: { to: string }) => {
    mockNavigate(props.to);
    return <div data-testid="navigate" />;
  },
}));

const setIsOnboardingAiChatEnabled = (value: boolean) => {
  jotaiStore.set(isOnboardingAiChatEnabledState.atom, value);
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

describe('WorkspaceSetup', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetJotaiStore();
    mockNavigate.mockClear();
  });

  it('should dress the chat for onboarding when the post-onboarding hint is set', () => {
    setIsOnboardingAiChatEnabled(true);
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    const { getByTestId } = render(<WorkspaceSetup />, { wrapper: Wrapper });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(getByTestId('header-title')).toHaveTextContent('Onboarding');
  });

  it('should render a plain chat when the post-onboarding hint is not set', () => {
    setIsOnboardingAiChatEnabled(true);

    const { getByTestId, queryByTestId } = render(<WorkspaceSetup />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(queryByTestId('preamble')).not.toBeInTheDocument();
    expect(getByTestId('header-title')).toHaveTextContent('Ask AI');
  });

  it('should redirect home when the onboarding ai chat is disabled', () => {
    setIsOnboardingAiChatEnabled(false);

    const { queryByTestId } = render(<WorkspaceSetup />, { wrapper: Wrapper });

    expect(queryByTestId('ai-chat-tab')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(defaultHomePagePath);
  });
});
