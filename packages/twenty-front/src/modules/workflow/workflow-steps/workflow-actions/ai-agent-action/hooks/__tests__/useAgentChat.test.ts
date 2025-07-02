import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { useAgentChat } from '../useAgentChat';

jest.mock('~/generated-metadata/graphql', () => ({
  useAgentChatThreadsQuery: jest.fn(() => ({
    data: { agentChatThreads: [{ id: 'thread-1' }] },
    refetch: jest.fn(),
  })),
  useAgentChatMessagesQuery: jest.fn(() => ({ loading: false })),
  useCreateAgentChatThreadMutation: jest.fn(() => [jest.fn()]),
  useSendAgentChatMessageMutation: jest.fn(() => [
    jest.fn(),
    { loading: false },
  ]),
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2',
  () => ({
    useRecoilComponentStateV2: () => [[], jest.fn()],
  }),
);

jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperElement', () => ({
  useScrollWrapperElement: () => ({
    scrollWrapperHTMLElement: { scroll: jest.fn(), scrollHeight: 0 },
  }),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useScopedHotkeys', () => ({
  useScopedHotkeys: jest.fn(),
}));

describe('useAgentChat', () => {
  it('should return the expected default values and handlers', () => {
    const { result } = renderHook(() => useAgentChat('agent-1'), {
      wrapper: RecoilRoot,
    });

    expect(result.current).toHaveProperty('handleInputChange');
    expect(result.current).toHaveProperty('messages');
    expect(result.current).toHaveProperty('input');
    expect(result.current).toHaveProperty('handleSendMessage');
    expect(result.current).toHaveProperty('messagesLoading');
    expect(result.current).toHaveProperty('sendingMessage');
    expect(typeof result.current.handleInputChange).toBe('function');
    expect(typeof result.current.handleSendMessage).toBe('function');
    expect(Array.isArray(result.current.messages)).toBe(true);
  });
});
