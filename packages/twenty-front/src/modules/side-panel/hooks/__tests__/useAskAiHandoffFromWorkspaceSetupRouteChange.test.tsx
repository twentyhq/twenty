import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { WorkspaceSetupChatSidePanelHandoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatSidePanelHandoffEffect';
import { useAskAiHandoffFromWorkspaceSetup } from '@/side-panel/hooks/useAskAiHandoffFromWorkspaceSetup';
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
  const { shouldShrinkFromFullWidth } = useAskAiHandoffFromWorkspaceSetup();

  return (
    <div data-testid="side-panel">{String(shouldShrinkFromFullWidth)}</div>
  );
};

// Mirrors the real router: the workspace setup page is a sibling of the layout
// owning the side panel, so leaving it unmounts one subtree and mounts the
// other in a single commit.
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

describe('useAskAiHandoffFromWorkspaceSetup on route change', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
    navigateAwayFromWorkspaceSetup = undefined;
  });

  it('should still read the handoff marker when the workspace setup page unmounts in the same commit', () => {
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
  });
});
