import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getAiChatThreadRollbackUpdate } from '@/ai-chat/threads/utils/getAiChatThreadRollbackUpdate';

const buildThread = (
  fields: Partial<AiChatThreadRecord>,
): AiChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id: 'thread',
  title: null,
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...fields,
});

describe('getAiChatThreadRollbackUpdate', () => {
  it('restores every field that still holds the optimistic value', () => {
    expect(
      getAiChatThreadRollbackUpdate({
        optimisticUpdate: { id: 'thread', assigneeId: 'jane', channelId: null },
        previousThread: buildThread({ assigneeId: 'tom', channelId: 'sales' }),
        currentThread: buildThread({ assigneeId: 'jane', channelId: null }),
      }),
    ).toEqual({ id: 'thread', assigneeId: 'tom', channelId: 'sales' });
  });

  it('restores nothing when any field changed since', () => {
    expect(
      getAiChatThreadRollbackUpdate({
        optimisticUpdate: {
          id: 'thread',
          channelId: 'support',
          channelArchivedAt: null,
        },
        previousThread: buildThread({
          channelId: 'sales',
          channelArchivedAt: '2026-11-02T00:00:00.000Z',
        }),
        currentThread: buildThread({
          channelId: 'marketing',
          channelArchivedAt: null,
        }),
      }),
    ).toBeNull();
  });

  it('keeps an assignee set since by someone else', () => {
    expect(
      getAiChatThreadRollbackUpdate({
        optimisticUpdate: { id: 'thread', assigneeId: 'jane' },
        previousThread: buildThread({ assigneeId: 'tom' }),
        currentThread: buildThread({ assigneeId: 'ana' }),
      }),
    ).toBeNull();
  });

  it('treats a missing field as null', () => {
    expect(
      getAiChatThreadRollbackUpdate({
        optimisticUpdate: { id: 'thread', channelArchivedAt: null },
        previousThread: buildThread({
          channelArchivedAt: '2026-11-02T00:00:00.000Z',
        }),
        currentThread: buildThread({}),
      }),
    ).toEqual({ id: 'thread', channelArchivedAt: '2026-11-02T00:00:00.000Z' });
  });
});
