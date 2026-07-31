import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEmptyState } from '@/ai/components/AiChatEmptyState';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/suggested-prompts/AiChatSuggestedPrompts', () => ({
  AiChatSuggestedPrompts: () => <div data-testid="suggested-prompts" />,
}));

const INSTANCE_ID = 'aiChatEmptyStateTest';
const THREAD_ID = 'thread-1';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('AiChatEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should render the suggested prompts when there is no message, no error and nothing loading', () => {
    const { getByTestId } = render(<AiChatEmptyState editor={null} />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('suggested-prompts')).toBeInTheDocument();
  });

  it('should render nothing when the current thread is awaiting its first chunk', () => {
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: { threadId: THREAD_ID },
      }),
      true,
    );

    const { container } = render(<AiChatEmptyState editor={null} />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the current thread is streaming', () => {
    jotaiStore.set(
      agentChatIsStreamingComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: { threadId: THREAD_ID },
      }),
      true,
    );

    const { container } = render(<AiChatEmptyState editor={null} />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
