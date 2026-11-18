import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEmptyState } from '@/ai-chat/composer/components/AiChatEmptyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock(
  '@/ai-chat/suggested-prompts/components/AiChatSuggestedPrompts',
  () => ({
    AiChatSuggestedPrompts: () => <div data-testid="suggested-prompts" />,
  }),
);

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AiChatTestInstance threadId={THREAD_ID}>{children}</AiChatTestInstance>
  </JotaiProvider>
);

describe('AiChatEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(newAiChatThreadIdState.atom, THREAD_ID);
  });

  it('should render the suggested prompts when there is no message, no error and nothing loading', () => {
    const { getByTestId } = render(<AiChatEmptyState />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('suggested-prompts')).toBeInTheDocument();
  });

  it('should render nothing when the current thread is awaiting its first chunk', () => {
    jotaiStore.set(
      aiChatIsAwaitingFirstChunkFamilyState.atomFamily({
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
      aiChatIsStreamingFamilyState.atomFamily({ threadId: THREAD_ID }),
      true,
    );

    const { container } = render(<AiChatEmptyState />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
