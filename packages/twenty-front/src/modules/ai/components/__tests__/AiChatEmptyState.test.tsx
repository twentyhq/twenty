import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { InboxEmptyState } from '@/ai/components/AiChatEmptyState';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
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

describe('InboxEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(newInboxThreadIdState.atom, THREAD_ID);
    jotaiStore.set(currentInboxThreadState.atom, THREAD_ID);
    jotaiStore.set(inboxDisplayedThreadState.atom, THREAD_ID);
  });

  it('should render the suggested prompts when there is no message, no error and nothing loading', () => {
    const { getByTestId } = render(<InboxEmptyState />, {
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

    const { container } = render(<InboxEmptyState />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the current thread is streaming', () => {
    jotaiStore.set(
      agentChatIsStreamingFamilyState.atomFamily({ threadId: THREAD_ID }),
      true,
    );

    const { container } = render(<InboxEmptyState />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
