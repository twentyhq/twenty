import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';

type TestThread = {
  id: string;
  lastMessageAt?: string | Date | null;
  updatedAt: string | Date;
};

describe('sortChatThreadsByLastActivityDesc', () => {
  it('sorts threads without relying on Array.prototype.toSorted', () => {
    const threads: TestThread[] = [
      {
        id: 'older',
        lastMessageAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 'newer',
        lastMessageAt: '2026-05-02T10:00:00.000Z',
        updatedAt: '2026-05-02T10:00:00.000Z',
      },
      {
        id: 'updated',
        lastMessageAt: null,
        updatedAt: '2026-05-03T10:00:00.000Z',
      },
    ];
    Object.defineProperty(threads, 'toSorted', { value: undefined });

    const result = sortChatThreadsByLastActivityDesc(threads);

    expect(result.map((thread) => thread.id)).toEqual([
      'updated',
      'newer',
      'older',
    ]);
    expect(threads.map((thread) => thread.id)).toEqual([
      'older',
      'newer',
      'updated',
    ]);
  });
});
