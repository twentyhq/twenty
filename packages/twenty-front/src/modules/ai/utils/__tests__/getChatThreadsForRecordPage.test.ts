import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { getChatThreadsForRecordPage } from '@/ai/utils/getChatThreadsForRecordPage';

const PAGE_SIZE = 20;

const buildThread = ({
  id,
  updatedAt,
  lastActivityAt,
}: {
  id: string;
  updatedAt: string;
  lastActivityAt?: string;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  createdAt: updatedAt,
  updatedAt,
  lastActivityAt,
});

const buildLink = ({
  id,
  thread,
}: {
  id: string;
  thread?: AgentChatThreadRecord | null;
}): AgentChatThreadTargetRecord => ({
  __typename: 'AgentChatThreadTarget',
  id,
  threadId: thread?.id ?? 'missing-thread',
  thread,
});

describe('getChatThreadsForRecordPage', () => {
  it('sorts unique conversations by activity while skipping missing records', () => {
    const olderThread = buildThread({
      id: 'older-thread',
      updatedAt: '2026-09-28T10:00:00.000Z',
      lastActivityAt: '2026-09-28T09:00:00.000Z',
    });
    const newerThread = buildThread({
      id: 'newer-thread',
      updatedAt: '2026-09-29T10:00:00.000Z',
    });
    const links = [
      buildLink({ id: 'older-link', thread: olderThread }),
      buildLink({ id: 'missing-link' }),
      buildLink({ id: 'newer-link', thread: newerThread }),
      buildLink({ id: 'duplicate-link', thread: olderThread }),
      buildLink({ id: 'deleted-link', thread: null }),
    ];

    const page = getChatThreadsForRecordPage({ links, pageSize: PAGE_SIZE });

    expect(page.threads).toEqual([newerThread, olderThread]);
    expect(links[0].thread).toBe(olderThread);
  });

  it('refreshes every loaded link even when all links describe one conversation', () => {
    const thread = buildThread({
      id: 'repeated-thread',
      updatedAt: '2026-09-28T10:00:00.000Z',
    });
    const links = Array.from({ length: 40 }, (_, index) =>
      buildLink({ id: `link-${index}`, thread }),
    );

    const page = getChatThreadsForRecordPage({ links, pageSize: PAGE_SIZE });

    expect(page.threads).toEqual([thread]);
    expect(page.refetchLimit).toBe(40);
  });

  it('caps the refresh at the maximum records per query', () => {
    const links = Array.from({ length: QUERY_MAX_RECORDS + 20 }, (_, index) =>
      buildLink({
        id: `link-${index}`,
        thread: buildThread({
          id: `thread-${index}`,
          updatedAt: '2026-09-28T10:00:00.000Z',
        }),
      }),
    );

    const page = getChatThreadsForRecordPage({ links, pageSize: PAGE_SIZE });

    expect(page.refetchLimit).toBe(QUERY_MAX_RECORDS);
  });

  it('requests a full first page when no links are loaded', () => {
    expect(
      getChatThreadsForRecordPage({ links: [], pageSize: PAGE_SIZE }),
    ).toEqual({ threads: [], refetchLimit: PAGE_SIZE });
  });
});
