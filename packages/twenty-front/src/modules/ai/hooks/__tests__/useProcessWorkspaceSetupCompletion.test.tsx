import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useProcessWorkspaceSetupCompletion } from '@/ai/hooks/useProcessWorkspaceSetupCompletion';
import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: () => ({ defaultHomePagePath: '/objects/people' }),
}));

const openAskAiPageMock = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: openAskAiPageMock }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
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
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

const buildCompletionMessage = (toolCallId: string): ExtendedUIMessage =>
  ({
    id: 'message-1',
    role: 'assistant',
    parts: [
      { type: 'text', text: 'Here is what we built together.' },
      {
        type: 'tool-complete_workspace_setup',
        toolCallId,
        input: {},
        output: { success: true, message: 'Setup marked as finished.' },
        state: 'output-available',
      },
    ],
  }) as unknown as ExtendedUIMessage;

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

  it('should redirect to the companies view and move the chat to the side panel', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion(
        buildCompletionMessage('call-1'),
      );
    });

    expect(navigateMock).toHaveBeenCalledWith('/objects/companies');
    expect(openAskAiPageMock).toHaveBeenCalledWith({
      resetNavigationStack: true,
    });
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
    expect(openAskAiPageMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual(['call-1']);
  });

  it('should ignore a message without a successful completion part', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion({
        id: 'message-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-complete_workspace_setup',
            toolCallId: 'call-1',
            input: {},
            state: 'input-streaming',
          },
        ],
      } as unknown as ExtendedUIMessage);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual([]);
  });

  it('should not redirect nor consume the tool call when the completion failed', () => {
    const { result } = renderHook(() => useProcessWorkspaceSetupCompletion(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.processWorkspaceSetupCompletion({
        id: 'message-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-complete_workspace_setup',
            toolCallId: 'call-1',
            input: {},
            state: 'output-available',
            output: { success: false, message: 'Something went wrong.' },
          },
        ],
      } as unknown as ExtendedUIMessage);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(getProcessedToolCallIds()).toEqual([]);
  });
});
