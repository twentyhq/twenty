import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { WorkspaceSetupChatSidePanelEffect } from '@/onboarding/effect-components/WorkspaceSetupChatSidePanelEffect';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const openAskAiPage = jest.fn();
jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage }),
}));

let navigate: ReturnType<typeof useNavigate>;
const NavigateProbeEffect = () => {
  navigate = useNavigate();
  return null;
};

const renderEffect = (pathname = '/objects/companies') =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[pathname]}>
        <NavigateProbeEffect />
        <WorkspaceSetupChatSidePanelEffect />
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('WorkspaceSetupChatSidePanelEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
  });

  it('opens onboarding chat once on the homepage and preserves setup mode', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    renderEffect();

    expect(openAskAiPage).toHaveBeenCalledWith({ resetNavigationStack: true });
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      true,
    );

    act(() => navigate('/objects/people'));
    expect(openAskAiPage).toHaveBeenCalledTimes(1);
  });

  it('does not reopen a dismissed panel after the layout remounts', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    const { unmount } = renderEffect();
    expect(
      sessionStorage.getItem('hasOpenedWorkspaceSetupChatSidePanelState'),
    ).toBe('true');
    unmount();
    renderEffect();

    expect(openAskAiPage).toHaveBeenCalledTimes(1);
  });

  it('allows a subsequent onboarding session to open the panel', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
    renderEffect();
    act(() => jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, false));
    act(() => jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true));

    expect(openAskAiPage).toHaveBeenCalledTimes(2);
  });

  it('opens when onboarding completes after the layout has mounted', () => {
    renderEffect();
    expect(openAskAiPage).not.toHaveBeenCalled();

    act(() => jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true));
    expect(openAskAiPage).toHaveBeenCalledTimes(1);
  });

  it.each(['/chat', '/chat/thread', '/settings/profile'])(
    'does not open a second chat surface on %s',
    (pathname) => {
      jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
      renderEffect(pathname);
      expect(openAskAiPage).not.toHaveBeenCalled();
    },
  );
});
