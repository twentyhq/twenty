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

jest.mock('@/ai/components/AiChatTab', () => ({
  AiChatTab: ({ messageListPreamble }: { messageListPreamble?: ReactNode }) => (
    <div data-testid="ai-chat-tab">{messageListPreamble}</div>
  ),
}));

jest.mock('@/ai/components/AiChatCollapseButton', () => ({
  AiChatCollapseButton: () => <button type="button">collapse</button>,
}));

jest.mock('@/ai/components/AiChatCloseButton', () => ({
  AiChatCloseButton: () => <button type="button">close</button>,
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

  it('should render the chat regardless of pending state', () => {
    setOnboardingAiChatFeatureFlag(true);

    const { getByTestId, getByText } = render(<WorkspaceSetup />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('ai-chat-tab')).toBeInTheDocument();
    expect(getByTestId('preamble')).toBeInTheDocument();
    expect(getByText('Onboarding')).toBeInTheDocument();
  });

  it('should consume the workspace-setup pending flag on mount', () => {
    setOnboardingAiChatFeatureFlag(true);
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);

    render(<WorkspaceSetup />, { wrapper: Wrapper });

    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('should redirect home when the onboarding ai chat feature flag is disabled', () => {
    setOnboardingAiChatFeatureFlag(false);

    const { queryByTestId } = render(<WorkspaceSetup />, { wrapper: Wrapper });

    expect(queryByTestId('ai-chat-tab')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(defaultHomePagePath);
  });
});
