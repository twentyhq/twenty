import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatNewThreadSelectionEffect } from '@/ai/components/AiChatNewThreadSelectionEffect';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const DRAFT_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const NEXT_DRAFT_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
const EXISTING_THREAD_ID = '20202020-0000-4000-8000-0000000000cc';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('AiChatNewThreadSelectionEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(newAiChatThreadIdState.atom, DRAFT_THREAD_ID);
  });

  it('selects the draft when entering a new chat route from a saved chat', () => {
    jotaiStore.set(currentAiChatThreadState.atom, EXISTING_THREAD_ID);

    render(<AiChatNewThreadSelectionEffect />, { wrapper: Wrapper });

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(DRAFT_THREAD_ID);
  });

  it('keeps the sent thread selected while the next draft is created', () => {
    jotaiStore.set(currentAiChatThreadState.atom, DRAFT_THREAD_ID);
    const { rerender } = render(<AiChatNewThreadSelectionEffect />, {
      wrapper: Wrapper,
    });

    act(() => {
      jotaiStore.set(newAiChatThreadIdState.atom, NEXT_DRAFT_THREAD_ID);
    });
    rerender(<AiChatNewThreadSelectionEffect />);

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(DRAFT_THREAD_ID);
  });
});
