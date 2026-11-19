import { type InboxLoadedThreadList } from '@/inbox/types/InboxLoadedThreadList';
import { prependInboxThreadListThreadId } from '@/inbox/utils/prependInboxThreadListThreadId';

const INBOX_THREAD_LIST: InboxLoadedThreadList = {
  threadIds: ['thread-1', 'thread-2'],
  hasNextPage: true,
  endCursor: 'page-1',
  lastLoadedActivityAt: null,
};

describe('prependInboxThreadListThreadId', () => {
  it('puts a new thread first', () => {
    expect(
      prependInboxThreadListThreadId({
        inboxThreadList: INBOX_THREAD_LIST,
        threadId: 'thread-3',
      }),
    ).toEqual({
      ...INBOX_THREAD_LIST,
      threadIds: ['thread-3', 'thread-1', 'thread-2'],
    });
  });

  it('keeps the list as it is when the thread is already listed', () => {
    expect(
      prependInboxThreadListThreadId({
        inboxThreadList: INBOX_THREAD_LIST,
        threadId: 'thread-2',
      }),
    ).toBe(INBOX_THREAD_LIST);
  });
});
