import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { InboxThreadPagination } from '@/ai/components/AiChatInboxThreadPagination';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { type InboxThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { setInboxSelectedChannelView } from '@/ai/testing/setAgentChatSelectedChannelView';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const loadInboxThreadList = jest.fn();

jest.mock('@/ai/hooks/useLoadAgentChatThreadList', () => ({
  useLoadInboxThreadList: () => ({ loadInboxThreadList }),
}));

const ACTIVE_PRESET_FILTER_SOURCE: InboxThreadListSource = {
  type: 'presetFilter',
  presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
};

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
  jotaiStore.set(
    inboxThreadListFamilyState.atomFamily(
      getInboxThreadListSourceKey(ACTIVE_PRESET_FILTER_SOURCE),
    ),
    {
      threadIds: THREADS.map(({ id }) => id),
      hasNextPage,
      endCursor: null,
      lastLoadedActivityAt: null,
    },
  );

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <InboxThreadPagination
          threads={THREADS}
          threadId={threadId}
          onThreadSelect={onThreadSelect}
        />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('InboxThreadPagination', () => {
  beforeEach(() => {
    resetJotaiStore();
    loadInboxThreadList.mockClear();
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
    expect(loadInboxThreadList).not.toHaveBeenCalled();
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
    expect(loadInboxThreadList).toHaveBeenCalledTimes(1);
    expect(loadInboxThreadList).toHaveBeenCalledWith({
      source: ACTIVE_PRESET_FILTER_SOURCE,
      mode: 'fetch-more',
    });
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
    expect(loadInboxThreadList).toHaveBeenCalledTimes(1);
    expect(loadInboxThreadList).toHaveBeenCalledWith({
      source: ACTIVE_PRESET_FILTER_SOURCE,
      mode: 'fetch-more',
    });
  });

  it('shows nothing for a chat that is not listed', () => {
    const { container } = renderPagination({
      threadId: 'thread-4',
      hasNextPage: false,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('loads more chats of the channel on screen', () => {
    const channelView = {
      channelId: 'channel-id',
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment: AgentChatChannelAssignmentFilter.ANY,
      filter: AgentChatChannelThreadFilter.ANY,
    };

    setInboxSelectedChannelView(jotaiStore, channelView);
    jotaiStore.set(
      inboxThreadListFamilyState.atomFamily(
        getInboxThreadListSourceKey({ type: 'channel', channelView }),
      ),
      {
        threadIds: THREADS.map(({ id }) => id),
        hasNextPage: true,
        endCursor: null,
        lastLoadedActivityAt: null,
      },
    );

    renderPagination({ threadId: 'thread-3', hasNextPage: false });

    fireEvent.click(screen.getByRole('button', { name: 'Next chat' }));

    expect(loadInboxThreadList).toHaveBeenCalledTimes(1);
    expect(loadInboxThreadList).toHaveBeenCalledWith({
      source: { type: 'channel', channelView },
      mode: 'fetch-more',
    });
  });
});
