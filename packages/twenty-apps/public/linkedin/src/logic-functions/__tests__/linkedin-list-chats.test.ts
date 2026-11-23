import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listUnipileInboxIds: vi.fn(),
  listMostRecentUnipileChats: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
}));

vi.mock('src/unipile/utils/list-unipile-inbox-ids.util', () => ({
  listUnipileInboxIds: mocks.listUnipileInboxIds,
}));

vi.mock('src/unipile/utils/list-most-recent-unipile-chats.util', () => ({
  listMostRecentUnipileChats: mocks.listMostRecentUnipileChats,
}));

const { linkedinListChatsHandler } =
  await import('src/logic-functions/linkedin-list-chats');

const listChats = (body: Record<string, unknown> = {}) =>
  linkedinListChatsHandler(
    { body },
    {
      userWorkspaceId: 'member-user-workspace-id',
    },
  );

const buildChats = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `chat-${index}`,
    name: `Chat ${index}`,
    is_group: false,
    is_1to1: true,
  }));

describe('linkedinListChatsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listConnections.mockResolvedValue([
      {
        id: 'connection-id',
        externalAccountId: 'acc_1',
        userWorkspaceId: 'member-user-workspace-id',
      },
    ]);
    mocks.listUnipileInboxIds.mockResolvedValue(['inbox-1', 'inbox-2']);
    mocks.listMostRecentUnipileChats.mockResolvedValue([]);
  });

  it('lists the conversations of the member across their inboxes, under the name of the other person or of the group', async () => {
    mocks.listMostRecentUnipileChats.mockResolvedValue([
      {
        id: 'chat-1',
        name: '',
        is_group: false,
        is_1to1: true,
        last_message_timestamp: '2026-10-29T07:44:08.382Z',
        user: { id: 'ACoPRIYA', display_name: 'Priya Nair' },
      },
      { id: 'chat-2', name: 'Q4 hiring', is_group: true, is_1to1: false },
      { id: 'chat-3', name: '', is_group: false, is_1to1: true },
    ]);

    await expect(listChats()).resolves.toEqual({
      chats: [
        {
          id: 'chat-1',
          name: 'Priya Nair',
          isGroup: false,
          lastMessageAt: '2026-10-29T07:44:08.382Z',
        },
        { id: 'chat-2', name: 'Q4 hiring', isGroup: true },
        { id: 'chat-3', name: 'chat-3', isGroup: false },
      ],
      hasMore: false,
    });
    expect(mocks.listMostRecentUnipileChats).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'acc_1',
        inboxIds: ['inbox-1', 'inbox-2'],
        limit: 50,
      }),
    );
  });

  it('says more conversations can be loaded when the page came back full', async () => {
    mocks.listMostRecentUnipileChats.mockResolvedValue(buildChats(100));

    await expect(listChats({ limit: 100 })).resolves.toMatchObject({
      hasMore: true,
    });
  });

  it('lists 200 conversations at most', async () => {
    mocks.listMostRecentUnipileChats.mockResolvedValue(buildChats(200));

    await expect(listChats({ limit: 5000 })).resolves.toMatchObject({
      hasMore: false,
    });
    expect(mocks.listMostRecentUnipileChats).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 200 }),
    );
  });

  it('refuses a member without a LinkedIn connection', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await expect(listChats()).rejects.toThrow(
      'Connect your LinkedIn account first.',
    );
    expect(mocks.listMostRecentUnipileChats).not.toHaveBeenCalled();
  });
});
