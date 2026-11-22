import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { useProcessWorkspaceSetupCompletion } from '@/ai-chat/workspace-setup/hooks/useProcessWorkspaceSetupCompletion';
import { processedWorkspaceSetupCompletionIdsState } from '@/ai-chat/workspace-setup/states/processedWorkspaceSetupCompletionIdsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
  useLocation: () => ({ state: null }),
}));

let defaultHomePagePath = '/objects/people';
jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath }),
}));

const closeSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: closeSidePanelMenuMock }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
      {children}
    </AiChatSurfaceContext.Provider>
  </JotaiProvider>
);

const buildMessageParts = (parts: unknown[]) =>
  ({ parts }) as Pick<ExtendedUIMessage, 'parts'>;

const buildCompletionMessage = (toolCallId: string) =>
  buildMessageParts([
    { type: 'text', text: 'Here is what we built together.' },
    {
      type: 'tool-complete_workspace_setup',
      toolCallId,
      input: {},
      output: { success: true, message: 'Setup marked as finished.' },
      state: 'output-available',
    },
  ]);

const getProcessedToolCallIds = () =>
  jotaiStore.get(processedWorkspaceSetupCompletionIdsState.atom);

describe('useProcessWorkspaceSetupCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
    jotaiStore.set(isWorkspaceSetupChatActiveState.atom, true);
    defaultHomePagePath = '/objects/people';
  });

  it('keeps the current page and side panel open when setup finishes there', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: ({ children }) => (
        <Wrapper>
          <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.SIDE_PANEL}>
            {children}
          </AiChatSurfaceContext.Provider>
        </Wrapper>
      ),
    });

    act(() =>
      result.current.processWorkspaceSetupCompletion(
        buildCompletionMessage('side-panel-call'),
      ),
    );

    expect(navigateMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
    expect(jotaiStore.get(isWorkspaceSetupChatActiveState.atom)).toBe(false);
    expect(getProcessedToolCallIds()).toEqual(['side-panel-call']);
  });

  it('should redirect to the available homepage and move the chat to the side panel', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion(
        buildCompletionMessage('call-1'),
      );
    });

    expect(navigateMock).toHaveBeenCalledWith('/objects/people');
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual(['call-1']);
  });

  it('should redirect only once when the same message is processed again', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    const message = buildCompletionMessage('call-1');

    act(() => {
      result.current.processWorkspaceSetupCompletion(message);
      result.current.processWorkspaceSetupCompletion(message);
    });

    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('returns to settings and ends setup when no readable object homepage exists', () => {
    defaultHomePagePath = '/settings/profile';
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() =>
      result.current.processWorkspaceSetupCompletion(
        buildCompletionMessage('fallback-call'),
      ),
    );

    expect(navigateMock).toHaveBeenCalledWith('/settings/profile', {
      state: { isAiChatHandoffSkipped: true },
    });
    expect(jotaiStore.get(isWorkspaceSetupChatActiveState.atom)).toBe(false);
  });

  it('should not redirect when the chat already left the setup page', () => {
    jotaiStore.set(isWorkspaceSetupChatActiveState.atom, false);

    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion(
        buildCompletionMessage('call-1'),
      );
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual(['call-1']);
  });
});
