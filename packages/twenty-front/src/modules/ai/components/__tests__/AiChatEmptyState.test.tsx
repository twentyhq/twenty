import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEmptyState } from '@/ai/components/AiChatEmptyState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/suggested-prompts/AiChatSuggestedPrompts', () => ({
  AiChatSuggestedPrompts: () => <div data-testid="suggested-prompts" />,
}));

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('AiChatEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(newAiChatThreadIdState.atom, THREAD_ID);
    jotaiStore.set(currentAiChatThreadState.atom, THREAD_ID);
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should render the suggested prompts when there is no message, no error and nothing loading', () => {
    const { getByTestId } = render(<AiChatEmptyState />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('suggested-prompts')).toBeInTheDocument();
  });

  it('should render nothing when the current thread is awaiting its first chunk', () => {
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      true,
    );

    const { container } = render(<AiChatEmptyState />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the current thread is streaming', () => {
    jotaiStore.set(
      agentChatIsStreamingFamilyState.atomFamily({ threadId: THREAD_ID }),
      true,
    );

    const { container } = render(<AiChatEmptyState />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
