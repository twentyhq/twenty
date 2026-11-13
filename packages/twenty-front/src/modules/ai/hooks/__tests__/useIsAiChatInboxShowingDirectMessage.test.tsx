import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { useIsAiChatInboxShowingDirectMessage } from '@/ai/hooks/useIsAiChatInboxShowingDirectMessage';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const buildThread = (
  id: string,
  conversationType: AgentChatThreadConversationType,
): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: null,
  conversationType,
  deletedAt: null,
  createdAt: '2026-11-06T00:00:00.000Z',
  updatedAt: '2026-11-06T00:00:00.000Z',
});

const DIRECT_MESSAGE = buildThread(
  '8c3d5e7f-1a2b-4c6d-9e8f-0a1b2c3d4e5f',
  AgentChatThreadConversationType.DIRECT_MESSAGE,
);

const CHANNEL_CHAT = buildThread(
  '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60',
  AgentChatThreadConversationType.STANDARD,
);

const renderAtPath = (pathname: string) =>
  renderHook(() => useIsAiChatInboxShowingDirectMessage(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
      </JotaiProvider>
    ),
  });

describe('useIsAiChatInboxShowingDirectMessage', () => {
  beforeEach(() => {
    resetJotaiStore();
    [DIRECT_MESSAGE, CHANNEL_CHAT].forEach((thread) =>
      jotaiStore.set(recordStoreFamilyState.atomFamily(thread.id), thread),
    );
  });

  it.each([
    [`/inbox/${DIRECT_MESSAGE.id}`, true],
    [`/inbox/${CHANNEL_CHAT.id}`, false],
    ['/inbox', false],
    [`/chat/${DIRECT_MESSAGE.id}`, false],
  ])('on %s is %s', (pathname, isShowingDirectMessage) => {
    const { result } = renderAtPath(pathname);

    expect(result.current).toBe(isShowingDirectMessage);
  });
});
