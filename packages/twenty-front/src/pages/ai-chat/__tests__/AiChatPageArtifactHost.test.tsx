import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import type * as ReactModule from 'react';

import type * as WorkspaceTargetArtifactHostContextModule from '@/navigation/contexts/WorkspaceTargetArtifactHostContext';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { AiChatPage } from '~/pages/ai-chat/AiChatPage';

let mockIsMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => mockIsMobile,
}));

jest.mock('@/ai/components/AiChatTab', () => {
  const { useContext } = jest.requireActual('react') as typeof ReactModule;
  const { WorkspaceTargetArtifactHostContext } = jest.requireActual(
    '@/navigation/contexts/WorkspaceTargetArtifactHostContext',
  ) as typeof WorkspaceTargetArtifactHostContextModule;

  return {
    AiChatTab: () => (
      <div data-testid="artifact-host">
        {String(useContext(WorkspaceTargetArtifactHostContext))}
      </div>
    ),
  };
});

jest.mock('@/ai/components/AiChatPageHeader', () => ({
  AiChatPageHeader: () => null,
}));
jest.mock('@/ai/components/AiChatPageThreadUrlSyncEffect', () => ({
  AiChatPageThreadUrlSyncEffect: () => null,
}));
jest.mock('@/ai/components/AiChatPageCloseAskAiPanelEffect', () => ({
  AiChatPageCloseAskAiPanelEffect: () => null,
}));
jest.mock('@/ai/components/AiChatPageContinueInSidePanelEffect', () => ({
  AiChatPageContinueInSidePanelEffect: () => null,
}));
jest.mock('@/onboarding/components/WorkspaceSetupChatPreamble', () => ({
  WorkspaceSetupChatPreamble: () => null,
}));
jest.mock(
  '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect',
  () => ({
    WorkspaceSetupChatKickoffEffect: () => null,
  }),
);

const renderAiChatPage = ({ onboarding = false } = {}) => {
  const store = createStore();

  store.set(shouldOpenAiChatAfterOnboardingState.atom, onboarding);

  return render(
    <JotaiProvider store={store}>
      <AiChatPage />
    </JotaiProvider>,
  );
};

describe('AiChatPage artifact host capability', () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  it('hosts workspace artifacts beside the desktop conversation', () => {
    renderAiChatPage();

    expect(screen.getByTestId('artifact-host')).toHaveTextContent('true');
  });

  it('does not host a second surface on mobile', () => {
    mockIsMobile = true;

    renderAiChatPage();

    expect(screen.getByTestId('artifact-host')).toHaveTextContent('false');
  });

  it('does not interrupt the onboarding conversation with an artifact', () => {
    renderAiChatPage({ onboarding: true });

    expect(screen.getByTestId('artifact-host')).toHaveTextContent('false');
  });
});
