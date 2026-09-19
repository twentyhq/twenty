import { render } from '@testing-library/react';

import { AiChatMarkThreadReadEffect } from '@/ai/components/AiChatMarkThreadReadEffect';

const markAiChatThreadReadMock = jest.fn();

let displayedThread: string | null = 'thread-1';
let messages: { id: string }[] = [];

jest.mock('@/ai/hooks/useMarkAiChatThreadRead', () => ({
  useMarkAiChatThreadRead: () => ({
    markAiChatThreadRead: markAiChatThreadReadMock,
  }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => displayedThread,
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({
    useAtomComponentFamilyStateValue: () => messages,
  }),
);

describe('AiChatMarkThreadReadEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    displayedThread = 'thread-1';
    messages = [{ id: 'message-1' }];
  });

  it('records the displayed conversation as read', () => {
    render(<AiChatMarkThreadReadEffect />);

    expect(markAiChatThreadReadMock).toHaveBeenCalledWith('thread-1');
  });

  it('records it again when a message arrives while it stays open', () => {
    const { rerender } = render(<AiChatMarkThreadReadEffect />);

    expect(markAiChatThreadReadMock).toHaveBeenCalledTimes(1);

    messages = [{ id: 'message-1' }, { id: 'message-2' }];
    rerender(<AiChatMarkThreadReadEffect />);

    expect(markAiChatThreadReadMock).toHaveBeenCalledTimes(2);
  });

  it('records nothing for a conversation with no message', () => {
    messages = [];

    render(<AiChatMarkThreadReadEffect />);

    expect(markAiChatThreadReadMock).not.toHaveBeenCalled();
  });
});
