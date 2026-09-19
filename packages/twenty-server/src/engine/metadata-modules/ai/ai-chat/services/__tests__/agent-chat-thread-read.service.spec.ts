import { QueryFailedError } from 'typeorm';

import { AgentChatThreadReadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-read.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const READER_ID = 'reader-user-workspace-id';
const OUTSIDER_ID = 'outsider-user-workspace-id';
const LAST_MESSAGE_ID = 'last-message-id';

const uniqueViolation = () =>
  new QueryFailedError('insert', [], {
    code: '23505',
  } as unknown as Error);

const buildService = ({
  readers = [READER_ID],
  existingRead = null,
}: {
  readers?: string[];
  existingRead?: Record<string, unknown> | null;
} = {}) => {
  const readRepository = {
    update: jest
      .fn()
      .mockResolvedValue({ affected: existingRead === null ? 0 : 1 }),
    insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'read-id' }] }),
    find: jest.fn().mockResolvedValue([]),
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'read-id' }),
  };

  const threadRepository = {
    findOne: jest
      .fn()
      .mockImplementation((_workspaceId, { where }) =>
        Promise.resolve(
          Array.isArray(where) &&
            where.some((clause) => readers.includes(clause.userWorkspaceId))
            ? { id: THREAD_ID }
            : null,
        ),
      ),
    find: jest
      .fn()
      .mockImplementation((_workspaceId, { where }) =>
        Promise.resolve(
          Array.isArray(where) &&
            where.some((clause) => readers.includes(clause.userWorkspaceId))
            ? [{ id: THREAD_ID }]
            : [],
        ),
      ),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  // getUnreadThreadIds reads one row per thread through a DISTINCT ON query
  // builder rather than loading every message, so the builder is stubbed as a
  // chain ending in getRawMany.
  const lastMessageRows: {
    threadId: string;
    createdAt: Date;
    authorUserWorkspaceId: string | null;
  }[] = [];

  const queryBuilder: Record<string, jest.Mock> = {};

  for (const method of [
    'distinctOn',
    'select',
    'addSelect',
    'where',
    'andWhere',
    'orderBy',
    'addOrderBy',
  ]) {
    queryBuilder[method] = jest.fn(() => queryBuilder);
  }

  queryBuilder.getRawMany = jest.fn(() => Promise.resolve(lastMessageRows));

  const messageRepository = {
    findOne: jest.fn().mockResolvedValue({ id: LAST_MESSAGE_ID }),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  const service = new AgentChatThreadReadService(
    readRepository as never,
    threadRepository as never,
    messageRepository as never,
  );

  return {
    service,
    readRepository,
    threadRepository,
    messageRepository,
    lastMessageRows,
  };
};

const markRead = (
  service: AgentChatThreadReadService,
  userWorkspaceId: string,
) =>
  service.markThreadRead({
    threadId: THREAD_ID,
    userWorkspaceId,
    workspaceId: WORKSPACE_ID,
  });

describe('AgentChatThreadReadService', () => {
  describe('markThreadRead', () => {
    it('opens a cursor on the last message for a first read', async () => {
      const { service, readRepository } = buildService();

      await markRead(service, READER_ID);

      expect(readRepository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({
          threadId: THREAD_ID,
          userWorkspaceId: READER_ID,
          lastReadMessageId: LAST_MESSAGE_ID,
        }),
      );
    });

    it('moves an existing cursor without inserting again', async () => {
      const { service, readRepository } = buildService({
        existingRead: { id: 'read-id' },
      });

      await markRead(service, READER_ID);

      expect(readRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { threadId: THREAD_ID, userWorkspaceId: READER_ID },
        expect.objectContaining({ lastReadMessageId: LAST_MESSAGE_ID }),
      );
      expect(readRepository.insert).not.toHaveBeenCalled();
    });

    // Reading is what a reader may do, so a public-channel reader keeps a
    // cursor of their own rather than being refused.
    it('refuses somebody who cannot open the thread', async () => {
      const { service, readRepository } = buildService();

      await expect(markRead(service, OUTSIDER_ID)).rejects.toMatchObject({
        code: AiExceptionCode.THREAD_NOT_FOUND,
      });
      expect(readRepository.insert).not.toHaveBeenCalled();
    });

    it('keeps the read when two tabs race to open the cursor', async () => {
      const { service, readRepository } = buildService();

      readRepository.insert.mockRejectedValue(uniqueViolation());

      await markRead(service, READER_ID);

      expect(readRepository.update).toHaveBeenCalledTimes(2);
    });

    it('records a read on a thread that has no message yet', async () => {
      const { service, readRepository, messageRepository } = buildService();

      messageRepository.findOne.mockResolvedValue(null);

      await markRead(service, READER_ID);

      expect(readRepository.insert).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ lastReadMessageId: null }),
      );
    });
  });

  describe('getUnreadThreadIds', () => {
    const unreadFor = (
      service: AgentChatThreadReadService,
      threadIds: string[],
    ) =>
      service.getUnreadThreadIds({
        threadIds,
        userWorkspaceId: READER_ID,
        workspaceId: WORKSPACE_ID,
      });

    it('counts a thread whose last message landed after the cursor', async () => {
      const { service, readRepository, lastMessageRows } = buildService();

      readRepository.find.mockResolvedValue([
        { threadId: THREAD_ID, lastReadAt: new Date('2026-01-01T00:00:00Z') },
      ]);
      lastMessageRows.push({
        threadId: THREAD_ID,
        createdAt: new Date('2026-01-02T00:00:00Z'),
        authorUserWorkspaceId: OUTSIDER_ID,
      });

      expect(await unreadFor(service, [THREAD_ID])).toEqual([THREAD_ID]);
    });

    it('leaves a thread read when the cursor is past its last message', async () => {
      const { service, readRepository, lastMessageRows } = buildService();

      readRepository.find.mockResolvedValue([
        { threadId: THREAD_ID, lastReadAt: new Date('2026-01-03T00:00:00Z') },
      ]);
      lastMessageRows.push({
        threadId: THREAD_ID,
        createdAt: new Date('2026-01-02T00:00:00Z'),
        authorUserWorkspaceId: OUTSIDER_ID,
      });

      expect(await unreadFor(service, [THREAD_ID])).toEqual([]);
    });

    it('counts a thread nobody has opened yet', async () => {
      const { service, lastMessageRows } = buildService();

      lastMessageRows.push({
        threadId: THREAD_ID,
        createdAt: new Date('2026-01-02T00:00:00Z'),
        authorUserWorkspaceId: OUTSIDER_ID,
      });

      expect(await unreadFor(service, [THREAD_ID])).toEqual([THREAD_ID]);
    });

    it('leaves an empty thread out rather than calling it unread', async () => {
      const { service } = buildService();

      expect(await unreadFor(service, [THREAD_ID])).toEqual([]);
    });

    it('asks nothing of the database for an empty list', async () => {
      const { service, readRepository } = buildService();

      expect(await unreadFor(service, [])).toEqual([]);
      expect(readRepository.find).not.toHaveBeenCalled();
    });

    // Answering for a thread the caller cannot open would say whether it
    // exists and has been written in.
    it('says nothing about a thread the caller cannot open', async () => {
      const { service, readRepository, lastMessageRows } = buildService({
        readers: [],
      });

      lastMessageRows.push({
        threadId: THREAD_ID,
        createdAt: new Date('2026-01-02T00:00:00Z'),
        authorUserWorkspaceId: OUTSIDER_ID,
      });

      expect(await unreadFor(service, [THREAD_ID])).toEqual([]);
      expect(readRepository.find).not.toHaveBeenCalled();
    });

    // You were there when you wrote it, and on the deploy that introduces
    // cursors nobody has one yet — without this, every thread anybody has ever
    // written in reads as unread on first load.
    it('leaves a thread read when the last message is your own', async () => {
      const { service, lastMessageRows } = buildService();

      lastMessageRows.push({
        threadId: THREAD_ID,
        createdAt: new Date('2026-01-02T00:00:00Z'),
        authorUserWorkspaceId: READER_ID,
      });

      expect(await unreadFor(service, [THREAD_ID])).toEqual([]);
    });

    it('counts the assistant answering you as unread', async () => {
      const { service, lastMessageRows } = buildService();

      lastMessageRows.push({
        threadId: THREAD_ID,
        createdAt: new Date('2026-01-02T00:00:00Z'),
        authorUserWorkspaceId: null,
      });

      expect(await unreadFor(service, [THREAD_ID])).toEqual([THREAD_ID]);
    });
  });

  describe('markThreadReadByAssistant', () => {
    it('moves the thread cursor rather than opening a row for a person', async () => {
      const { service, threadRepository, readRepository } = buildService();

      await service.markThreadReadByAssistant({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: THREAD_ID },
        expect.objectContaining({
          assistantLastReadMessageId: LAST_MESSAGE_ID,
        }),
      );
      expect(readRepository.insert).not.toHaveBeenCalled();
    });
  });
});
