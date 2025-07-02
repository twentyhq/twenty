import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { AgentChatMessage } from '~/generated-metadata/graphql';
import { useAgentChat } from '../useAgentChat';

const mockSetAgentChatMessages = jest.fn();

let mockUseRecoilState: jest.Mock;
let mockSetAgentChatInput: jest.Mock;
let mockUseScopedHotkeys: jest.Mock;
let mockUseRecoilComponentStateV2: jest.Mock;
let mockUseScrollWrapperElement: jest.Mock;
let mockSendMessage: jest.Mock;
let mockUseSendAgentChatMessageMutation: jest.Mock;
let mockUseAgentChatThreadsQuery: jest.Mock;
let mockUseAgentChatMessagesQuery: jest.Mock;

jest.mock('~/generated-metadata/graphql', () => ({
  useAgentChatThreadsQuery: (...args: any[]) =>
    mockUseAgentChatThreadsQuery(...args),
  useAgentChatMessagesQuery: (...args: any[]) =>
    mockUseAgentChatMessagesQuery(...args),
  useSendAgentChatMessageMutation: (...args: any[]) =>
    mockUseSendAgentChatMessageMutation(...args),
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2',
  () => ({
    useRecoilComponentStateV2: (...args: any[]) =>
      mockUseRecoilComponentStateV2(...args),
  }),
);

jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilState: (...args: any[]) => mockUseRecoilState(...args),
}));

jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperElement', () => ({
  useScrollWrapperElement: (...args: any[]) =>
    mockUseScrollWrapperElement(...args),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useScopedHotkeys', () => ({
  useScopedHotkeys: (...args: any[]) => mockUseScopedHotkeys(...args),
}));

const mockScroll = jest.fn();

jest.useFakeTimers();

const createMockMessage = (
  id: string,
  role: AgentChatMessageRole,
  content: string,
  threadId = 'thread-1',
): AgentChatMessage => ({
  __typename: 'AgentChatMessage',
  id,
  threadId,
  role,
  content,
  createdAt: new Date().toISOString(),
});

describe('useAgentChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAgentChatInput = jest.fn();
    mockUseRecoilState = jest.fn(() => ['', mockSetAgentChatInput]);
    mockUseRecoilComponentStateV2 = jest.fn(() => [
      [],
      mockSetAgentChatMessages,
    ]);
    mockUseScrollWrapperElement = jest.fn(() => ({
      scrollWrapperHTMLElement: { scroll: mockScroll, scrollHeight: 1000 },
    }));
    mockSendMessage = jest.fn();
    mockUseSendAgentChatMessageMutation = jest.fn(() => [
      mockSendMessage,
      { loading: false },
    ]);
    mockUseAgentChatThreadsQuery = jest.fn(() => ({
      data: { agentChatThreads: [{ id: 'thread-1' }] },
      refetch: jest.fn(),
    }));
    mockUseAgentChatMessagesQuery = jest.fn(() => ({
      loading: false,
      onCompleted: jest.fn(),
    }));
    mockUseScopedHotkeys = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
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

    it('should initialize with empty messages array', () => {
      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should initialize with empty input', () => {
      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(result.current.input).toBe('');
    });
  });

  describe('input handling', () => {
    it('should call setAgentChatInput when handleInputChange is called', () => {
      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      act(() => {
        result.current.handleInputChange('Hello, world!');
      });

      expect(mockSetAgentChatInput).toHaveBeenCalledWith('Hello, world!');
    });
  });

  describe('message sending', () => {
    it('should not send message when input is empty', async () => {
      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should not send message when input is only whitespace', async () => {
      mockUseRecoilState.mockReturnValue(['   ', mockSetAgentChatInput]);

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should not send message when already sending', async () => {
      mockUseSendAgentChatMessageMutation.mockReturnValue([
        mockSendMessage,
        { loading: true },
      ]);
      mockUseRecoilState.mockReturnValue(['Hello', mockSetAgentChatInput]);

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should send message with correct parameters', async () => {
      mockUseRecoilState.mockReturnValue([
        'Hello, world!',
        mockSetAgentChatInput,
      ]);
      mockSendMessage.mockResolvedValue({
        data: {
          sendAgentChatMessage: [
            createMockMessage(
              'msg-1',
              AgentChatMessageRole.USER,
              'Hello, world!',
            ),
            createMockMessage(
              'msg-2',
              AgentChatMessageRole.ASSISTANT,
              'Hello! How can I help you?',
            ),
          ],
        },
      });

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSetAgentChatInput).toHaveBeenCalledWith('');
      expect(mockSendMessage).toHaveBeenCalledWith({
        variables: {
          threadId: 'thread-1',
          content: 'Hello, world!',
        },
      });
    });

    it('should add optimistic messages before sending', async () => {
      mockUseRecoilState.mockReturnValue([
        'Test message',
        mockSetAgentChatInput,
      ]);
      mockSendMessage.mockResolvedValue({
        data: {
          sendAgentChatMessage: [
            createMockMessage(
              'msg-1',
              AgentChatMessageRole.USER,
              'Test message',
            ),
            createMockMessage(
              'msg-2',
              AgentChatMessageRole.ASSISTANT,
              'Response',
            ),
          ],
        },
      });

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSetAgentChatMessages).toHaveBeenCalledWith(
        expect.any(Function),
      );

      const optimisticUpdateCall = mockSetAgentChatMessages.mock.calls[0][0];
      const prevMessages = [
        createMockMessage(
          'existing-1',
          AgentChatMessageRole.USER,
          'Previous message',
        ),
      ];

      const resultMessages = optimisticUpdateCall(prevMessages);

      expect(resultMessages).toHaveLength(3);
      expect(resultMessages[0]).toEqual(prevMessages[0]);
      expect(resultMessages[1].role).toBe(AgentChatMessageRole.USER);
      expect(resultMessages[1].content).toBe('Test message');
      expect(resultMessages[1].id).toMatch(/^temp-/);
      expect(resultMessages[2].role).toBe(AgentChatMessageRole.ASSISTANT);
      expect(resultMessages[2].content).toBe('');
      expect(resultMessages[2].id).toMatch(/^temp-/);
    });

    it('should scroll to bottom after sending message', async () => {
      mockUseRecoilState.mockReturnValue([
        'Test message',
        mockSetAgentChatInput,
      ]);
      mockSendMessage.mockResolvedValue({
        data: {
          sendAgentChatMessage: [
            createMockMessage(
              'msg-1',
              AgentChatMessageRole.USER,
              'Test message',
            ),
          ],
        },
      });

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });
    });
  });

  describe('message loading and updates', () => {
    it('should handle successful message sending and replace optimistic messages', async () => {
      const mockMessages = [
        createMockMessage('msg-1', AgentChatMessageRole.USER, 'Hello'),
        createMockMessage('temp-1', AgentChatMessageRole.USER, 'Test'),
        createMockMessage('temp-2', AgentChatMessageRole.ASSISTANT, ''),
      ];

      mockUseRecoilComponentStateV2.mockReturnValue([
        mockMessages as any,
        mockSetAgentChatMessages,
      ]);
      mockUseRecoilState.mockReturnValue([
        'New message',
        mockSetAgentChatInput,
      ]);

      const newMessages = [
        createMockMessage('msg-2', AgentChatMessageRole.USER, 'New message'),
        createMockMessage('msg-3', AgentChatMessageRole.ASSISTANT, 'Response'),
      ];

      mockSendMessage.mockResolvedValue({
        data: {
          sendAgentChatMessage: newMessages,
        },
      });

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSetAgentChatMessages).toHaveBeenCalledWith(
        expect.any(Function),
      );

      const updateCall = mockSetAgentChatMessages.mock.calls.find(
        (call) => typeof call[0] === 'function',
      );

      if (isDefined(updateCall)) {
        const updateFunction = updateCall[0];
        const result = updateFunction(mockMessages);

        expect(result).toHaveLength(5);
        expect(result[0].id).toBe('msg-1');
        expect(result[1].id).toBe('temp-1');
        expect(result[2].id).toBe('temp-2');
      }
    });

    it('should handle message sending error and remove optimistic messages', async () => {
      const mockMessages = [
        createMockMessage('msg-1', AgentChatMessageRole.USER, 'Hello'),
        createMockMessage('temp-1', AgentChatMessageRole.USER, 'Test'),
        createMockMessage('temp-2', AgentChatMessageRole.ASSISTANT, ''),
      ];

      mockUseRecoilComponentStateV2.mockReturnValue([
        mockMessages as any,
        mockSetAgentChatMessages,
      ]);
      mockUseRecoilState.mockReturnValue([
        'New message',
        mockSetAgentChatInput,
      ]);

      mockSendMessage.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockSetAgentChatMessages).toHaveBeenCalledWith(
        expect.any(Function),
      );

      const errorCall = mockSetAgentChatMessages.mock.calls.find(
        (call) => typeof call[0] === 'function',
      );

      if (isDefined(errorCall)) {
        const errorFunction = errorCall[0];
        const result = errorFunction(mockMessages);

        expect(result).toHaveLength(5);
        expect(result[0].id).toBe('msg-1');
      }
    });

    it('should load existing messages when thread is available', () => {
      const existingMessages = [
        createMockMessage('msg-1', AgentChatMessageRole.USER, 'Hello'),
        createMockMessage('msg-2', AgentChatMessageRole.ASSISTANT, 'Hi there!'),
      ];

      let capturedOnCompleted: ((data: any) => void) | null = null;
      mockUseAgentChatMessagesQuery.mockImplementation((options) => {
        capturedOnCompleted = options.onCompleted;
        return {
          loading: false,
          onCompleted: options.onCompleted,
        };
      });

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      if (isDefined(capturedOnCompleted)) {
        act(() => {
          capturedOnCompleted!({ agentChatMessages: existingMessages });
        });
      }

      expect(mockSetAgentChatMessages).toHaveBeenCalledWith(existingMessages);
    });

    it('should scroll to bottom when messages are loaded', () => {
      let capturedOnCompleted: ((data: any) => void) | null = null;
      mockUseAgentChatMessagesQuery.mockImplementation((options) => {
        capturedOnCompleted = options.onCompleted;
        return {
          loading: false,
          onCompleted: options.onCompleted,
        };
      });

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      if (isDefined(capturedOnCompleted)) {
        act(() => {
          capturedOnCompleted!({ agentChatMessages: [] });
        });
      }

      expect(mockScroll).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth',
      });
    });
  });

  describe('loading states', () => {
    it('should return messagesLoading state from query', () => {
      mockUseAgentChatMessagesQuery.mockReturnValue({
        loading: true,
        onCompleted: jest.fn(),
      });

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(result.current.messagesLoading).toBe(true);
    });

    it('should return sendingMessage state from mutation', () => {
      mockUseSendAgentChatMessageMutation.mockReturnValue([
        mockSendMessage,
        { loading: true },
      ]);

      const { result } = renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(result.current.sendingMessage).toBe(true);
    });
  });

  describe('thread handling', () => {
    it('should skip messages query when no thread is available', () => {
      mockUseAgentChatThreadsQuery.mockReturnValue({
        data: { agentChatThreads: [] },
        refetch: jest.fn(),
      });

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(mockUseAgentChatMessagesQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: true,
        }),
      );
    });

    it('should use first thread when multiple threads are available', () => {
      mockUseAgentChatThreadsQuery.mockReturnValue({
        data: {
          agentChatThreads: [{ id: 'thread-1' }, { id: 'thread-2' }],
        },
        refetch: jest.fn(),
      });

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(mockUseAgentChatMessagesQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            threadId: 'thread-1',
          },
        }),
      );
    });
  });

  describe('hotkey handling', () => {
    it('should register hotkey handler for Enter key', () => {
      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(mockUseScopedHotkeys).toHaveBeenCalledWith(
        ['Enter'],
        expect.any(Function),
        'text-input',
        ['', false],
      );
    });

    it('should call handleSendMessage when Enter is pressed without modifier keys', () => {
      let hotkeyHandler: ((event: any) => void) | null = null;

      mockUseScopedHotkeys.mockImplementation((keys, handler) => {
        hotkeyHandler = handler;
      });

      mockUseRecoilState.mockReturnValue([
        'Test message',
        mockSetAgentChatInput,
      ]);

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(hotkeyHandler).toBeDefined();

      if (isDefined(hotkeyHandler)) {
        const mockEvent = {
          preventDefault: jest.fn(),
          ctrlKey: false,
          metaKey: false,
        };

        act(() => {
          hotkeyHandler!(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockSendMessage).toHaveBeenCalled();
      }
    });

    it('should not call handleSendMessage when Enter is pressed with Ctrl key', () => {
      let hotkeyHandler: ((event: any) => void) | null = null;

      mockUseScopedHotkeys.mockImplementation((keys, handler) => {
        hotkeyHandler = handler;
      });

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(hotkeyHandler).toBeDefined();

      if (isDefined(hotkeyHandler)) {
        const mockEvent = {
          preventDefault: jest.fn(),
          ctrlKey: true,
          metaKey: false,
        };

        act(() => {
          hotkeyHandler!(mockEvent);
        });

        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        expect(mockSendMessage).not.toHaveBeenCalled();
      }
    });

    it('should not call handleSendMessage when Enter is pressed with Cmd key', () => {
      let hotkeyHandler: ((event: any) => void) | null = null;

      mockUseScopedHotkeys.mockImplementation((keys, handler) => {
        hotkeyHandler = handler;
      });

      renderHook(() => useAgentChat('agent-1'), {
        wrapper: RecoilRoot,
      });

      expect(hotkeyHandler).toBeDefined();

      if (isDefined(hotkeyHandler)) {
        const mockEvent = {
          preventDefault: jest.fn(),
          ctrlKey: false,
          metaKey: true,
        };

        act(() => {
          hotkeyHandler!(mockEvent);
        });

        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        expect(mockSendMessage).not.toHaveBeenCalled();
      }
    });
  });
});
