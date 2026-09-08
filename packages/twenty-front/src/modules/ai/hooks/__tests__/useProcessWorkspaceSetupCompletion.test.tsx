import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useProcessWorkspaceSetupCompletion } from '@/ai/hooks/useProcessWorkspaceSetupCompletion';
import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
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

jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath: '/objects/people' }),
}));

const closeSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: closeSidePanelMenuMock }),
}));

let isWorkspaceSetupChat = true;

jest.mock('@/ai/hooks/useIsWorkspaceSetupChat', () => ({
  useIsWorkspaceSetupChat: () => isWorkspaceSetupChat,
}));

const INSTANCE_ID = 'processWorkspaceSetupCompletionTest';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
        {children}
      </AiChatSurfaceContext.Provider>
    </AgentChatComponentInstanceContext.Provider>
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
  jotaiStore.get(
    processedToolExecutionPartIdsComponentState.atomFamily({
      instanceId: INSTANCE_ID,
    }),
  );

describe('useProcessWorkspaceSetupCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    resetJotaiStore();
    isWorkspaceSetupChat = true;
  });

  it('keeps the current page and side panel open when setup finishes there', () => {
    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, true);
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
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
    expect(getProcessedToolCallIds()).toEqual(['side-panel-call']);
  });

  it('should redirect to the companies view and move the chat to the side panel', () => {
    jotaiStore.set(shouldContinueAiChatInSidePanelState.atom, true);

    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion(
        buildCompletionMessage('call-1'),
      );
    });

    expect(navigateMock).toHaveBeenCalledWith('/objects/companies');
    expect(closeSidePanelMenuMock).not.toHaveBeenCalled();
    expect(jotaiStore.get(shouldContinueAiChatInSidePanelState.atom)).toBe(
      true,
    );
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

  it('should not redirect when the chat already left the setup page', () => {
    isWorkspaceSetupChat = false;

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

  it('should ignore a message without a successful completion part', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion(
        buildMessageParts([
          {
            type: 'tool-complete_workspace_setup',
            toolCallId: 'call-1',
            input: {},
            state: 'input-streaming',
          },
        ]),
      );
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual([]);
  });

  it('should not redirect nor consume the tool call when the completion failed', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion(
        buildMessageParts([
          {
            type: 'tool-complete_workspace_setup',
            toolCallId: 'call-1',
            input: {},
            state: 'output-available',
            output: { success: false, message: 'Something went wrong.' },
          },
        ]),
      );
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual([]);
  });
});
