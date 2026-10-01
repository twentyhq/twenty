import { render } from '@testing-library/react';
import { AppPath } from 'twenty-shared/types';

import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const navigate = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigate,
}));

const buildThreads = (ids: string[]) =>
  ids.map((id) => ({ id }) as AgentChatThreadRecord);

const expectSelected = (threadId: string | null) =>
  expect(navigate).toHaveBeenLastCalledWith(
    AppPath.AiChatInbox,
    { threadId },
    undefined,
    { replace: true },
  );

describe('AiChatInboxSelectionEffect', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it('selects the first chat when none is selected', () => {
    render(
      <AiChatInboxSelectionEffect
        selectedThreadId={undefined}
        threads={buildThreads(['thread-1', 'thread-2'])}
      />,
    );

    expectSelected('thread-1');
  });

  it('selects the chat that takes the place of the one leaving the list', () => {
    const { rerender } = render(
      <AiChatInboxSelectionEffect
        selectedThreadId="thread-2"
        threads={buildThreads(['thread-1', 'thread-2', 'thread-3'])}
      />,
    );

    expect(navigate).not.toHaveBeenCalled();

    rerender(
      <AiChatInboxSelectionEffect
        selectedThreadId="thread-2"
        threads={buildThreads(['thread-1', 'thread-3'])}
      />,
    );

    expectSelected('thread-3');
  });

  it('selects the previous chat when the last one leaves the list', () => {
    const { rerender } = render(
      <AiChatInboxSelectionEffect
        selectedThreadId="thread-2"
        threads={buildThreads(['thread-1', 'thread-2'])}
      />,
    );

    rerender(
      <AiChatInboxSelectionEffect
        selectedThreadId="thread-2"
        threads={buildThreads(['thread-1'])}
      />,
    );

    expectSelected('thread-1');
  });

  it('clears the selection when the list empties', () => {
    const { rerender } = render(
      <AiChatInboxSelectionEffect
        selectedThreadId="thread-1"
        threads={buildThreads(['thread-1'])}
      />,
    );

    rerender(
      <AiChatInboxSelectionEffect selectedThreadId="thread-1" threads={[]} />,
    );

    expectSelected(null);
  });

  it('keeps a chat opened from a link that is not listed', () => {
    render(
      <AiChatInboxSelectionEffect
        selectedThreadId="thread-9"
        threads={buildThreads(['thread-1'])}
      />,
    );

    expect(navigate).not.toHaveBeenCalled();
  });
});
