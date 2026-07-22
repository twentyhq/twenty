import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { WorkspaceSetup } from '~/pages/onboarding/WorkspaceSetup';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

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

const setOnboardingAiChatFeatureFlag = (value: boolean) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_ONBOARDING_AI_CHAT_ENABLED, value },
    ],
  });
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
    setOnboardingAiChatFeatureFlag(true);
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    const { getByTestId } = render(<WorkspaceSetup />, { wrapper: Wrapper });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(getByTestId('header-title')).toHaveTextContent('Onboarding');
  });

  // Expanding a normal chat must not inject the onboarding welcome text.
  it('should render a plain chat when the post-onboarding hint is not set', () => {
    setOnboardingAiChatFeatureFlag(true);

    const { getByTestId, queryByTestId } = render(<WorkspaceSetup />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(queryByTestId('preamble')).not.toBeInTheDocument();
    expect(getByTestId('header-title')).toHaveTextContent('Ask AI');
  });

  it('should redirect home when the onboarding ai chat feature flag is disabled', () => {
    setOnboardingAiChatFeatureFlag(false);

    const { queryByTestId } = render(<WorkspaceSetup />, { wrapper: Wrapper });

    expect(queryByTestId('ai-chat-tab')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(defaultHomePagePath);
  });
});
