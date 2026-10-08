import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatInboxThreadPagination } from '@/ai/components/AiChatInboxThreadPagination';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const fetchMoreAgentChatThreads = jest.fn();

jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({ fetchMoreAgentChatThreads }),
}));

const THREADS = [{ id: 'thread-1' }, { id: 'thread-2' }, { id: 'thread-3' }];

const renderPagination = ({
  threadId,
  hasNextPage,
  onThreadSelect = jest.fn(),
}: {
  threadId: string;
  hasNextPage: boolean;
  onThreadSelect?: (threadId: string) => void;
}) => {
  jotaiStore.set(agentChatThreadListState.atom, {
    threadIds: THREADS.map(({ id }) => id),
    hasNextPage,
    endCursor: null,
  });

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <AiChatInboxThreadPagination
          threads={THREADS}
          threadId={threadId}
          onThreadSelect={onThreadSelect}
        />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('AiChatInboxThreadPagination', () => {
  beforeEach(() => {
    resetJotaiStore();
    fetchMoreAgentChatThreads.mockClear();
  });

  it('moves to the previous and next chats', () => {
    const onThreadSelect = jest.fn();

    renderPagination({
      threadId: 'thread-2',
      hasNextPage: false,
      onThreadSelect,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Previous chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next chat' }));

    expect(onThreadSelect).toHaveBeenCalledTimes(2);
    expect(onThreadSelect).toHaveBeenNthCalledWith(1, 'thread-1');
    expect(onThreadSelect).toHaveBeenNthCalledWith(2, 'thread-3');
    expect(fetchMoreAgentChatThreads).not.toHaveBeenCalled();
  });

  it('stops at the last chat once every chat is loaded', () => {
    renderPagination({ threadId: 'thread-3', hasNextPage: false });

    expect(screen.getByRole('button', { name: 'Next chat' })).toBeDisabled();
  });

  it('loads more chats when moving onto the last loaded one', () => {
    const onThreadSelect = jest.fn();

    renderPagination({
      threadId: 'thread-2',
      hasNextPage: true,
      onThreadSelect,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next chat' }));

    expect(onThreadSelect).toHaveBeenCalledTimes(1);
    expect(onThreadSelect).toHaveBeenCalledWith('thread-3');
    expect(fetchMoreAgentChatThreads).toHaveBeenCalledTimes(1);
  });

  it('loads more chats from the last loaded one while more exist', () => {
    const onThreadSelect = jest.fn();

    renderPagination({
      threadId: 'thread-3',
      hasNextPage: true,
      onThreadSelect,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next chat' }));

    expect(onThreadSelect).not.toHaveBeenCalled();
    expect(fetchMoreAgentChatThreads).toHaveBeenCalledTimes(1);
  });

  it('shows nothing for a chat that is not listed', () => {
    const { container } = renderPagination({
      threadId: 'thread-4',
      hasNextPage: false,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
