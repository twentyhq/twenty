import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { WorkspaceSetupChatSidePanelHandoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatSidePanelHandoffEffect';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { SidePanelAskAiHandoffEffect } from '@/side-panel/components/SidePanelAskAiHandoffEffect';
import { useShouldShrinkSidePanelFromFullWidth } from '@/side-panel/hooks/useShouldShrinkSidePanelFromFullWidth';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const openAskAiPageMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: openAskAiPageMock }),
}));

jest.mock('framer-motion', () => ({
  useReducedMotion: () => false,
}));

let navigateAwayFromWorkspaceSetup: (() => void) | undefined;

const WorkspaceSetupRoute = () => {
  const navigate = useNavigate();

  navigateAwayFromWorkspaceSetup = () => navigate('/objects/companies');

  return <WorkspaceSetupChatSidePanelHandoffEffect />;
};

const SidePanelRoute = () => {
  const shouldShrinkFromFullWidth = useShouldShrinkSidePanelFromFullWidth();

  return (
    <>
      <SidePanelAskAiHandoffEffect />
      <div data-testid="side-panel">{String(shouldShrinkFromFullWidth)}</div>
    </>
  );
};

const RouterUnderTest = () => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter initialEntries={['/workspace-setup']}>
      <Routes>
        <Route path="/workspace-setup" element={<WorkspaceSetupRoute />} />
        <Route path="/objects/companies" element={<SidePanelRoute />} />
      </Routes>
    </MemoryRouter>
  </JotaiProvider>
);

describe('SidePanelAskAiHandoffEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
    navigateAwayFromWorkspaceSetup = undefined;
  });

  it('should consume the marker and open the ask ai page when the workspace setup page unmounts in the same commit', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    jotaiStore.set(aiChatExpandedReturnLocationState.atom, '/objects/people');

    const { getByTestId } = render(<RouterUnderTest />);

    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );

    act(() => {
      navigateAwayFromWorkspaceSetup?.();
    });

    expect(openAskAiPageMock).toHaveBeenCalledWith({
      resetNavigationStack: true,
    });
    expect(getByTestId('side-panel')).toHaveTextContent('true');
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
    expect(jotaiStore.get(aiChatExpandedReturnLocationState.atom)).toBeNull();
  });

  it('should do nothing when the marker is not set', () => {
    render(
      <JotaiProvider store={jotaiStore}>
        <SidePanelAskAiHandoffEffect />
      </JotaiProvider>,
    );

    expect(openAskAiPageMock).not.toHaveBeenCalled();
  });
});
