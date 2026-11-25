import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listMostRecentUnipileChats: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
}));

vi.mock('src/unipile/utils/list-most-recent-unipile-chats.util', () => ({
  listMostRecentUnipileChats: mocks.listMostRecentUnipileChats,
}));

const { whatsappListChatsHandler } =
  await import('src/logic-functions/whatsapp-list-chats');

const listChats = (body: Record<string, unknown> = {}) =>
  whatsappListChatsHandler(
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

describe('whatsappListChatsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listConnections.mockResolvedValue([
      {
        id: 'connection-id',
        externalAccountId: 'acc_1',
        userWorkspaceId: 'member-user-workspace-id',
      },
    ]);
    mocks.listMostRecentUnipileChats.mockResolvedValue([]);
  });

  it('lists the conversations of the member under the name they saved, groups under their own name', async () => {
    mocks.listMostRecentUnipileChats.mockResolvedValue([
      {
        id: 'chat-1',
        name: 'Priya',
        is_group: false,
        is_1to1: true,
        last_message_timestamp: '2026-10-29T07:44:08.382Z',
        user: {
          id: '33622222222@s.whatsapp.net',
          display_name: 'Priya',
          specifics: { contact_name: 'Priya Nair' },
        },
      },
      { id: 'chat-2', name: 'Q4 hiring', is_group: true, is_1to1: false },
      {
        id: 'chat-3',
        name: '',
        is_group: false,
        is_1to1: true,
        user: { id: '33633333333@s.whatsapp.net', display_name: '' },
      },
    ]);

    await expect(listChats()).resolves.toEqual({
      chats: [
        {
          id: 'chat-1',
          chatIds: ['chat-1'],
          name: 'Priya Nair',
          isGroup: false,
          lastMessageAt: '2026-10-29T07:44:08.382Z',
        },
        { id: 'chat-2', chatIds: ['chat-2'], name: 'Q4 hiring', isGroup: true },
        {
          id: 'chat-3',
          chatIds: ['chat-3'],
          name: '+33633333333',
          isGroup: false,
        },
      ],
      hasMore: false,
    });
    expect(mocks.listMostRecentUnipileChats).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 'acc_1', limit: 50 }),
    );
  });

  it('shows the two chats WhatsApp keeps with one person as a single conversation', async () => {
    mocks.listMostRecentUnipileChats.mockResolvedValue([
      {
        id: 'chat-lid',
        name: 'Priya',
        is_group: false,
        is_1to1: true,
        last_message_timestamp: '2026-10-29T07:44:08.382Z',
        user: {
          id: '199912345678901@lid',
          public_identifier: '33622222222',
          display_name: 'Priya Nair',
        },
      },
      {
        id: 'chat-phone',
        name: 'Priya',
        is_group: false,
        is_1to1: true,
        last_message_timestamp: '2026-10-01T00:00:00.000Z',
        user: { id: '33622222222@s.whatsapp.net', display_name: 'Priya Nair' },
      },
    ]);

    await expect(listChats()).resolves.toMatchObject({
      chats: [
        {
          id: 'chat-lid',
          chatIds: ['chat-lid', 'chat-phone'],
          name: 'Priya Nair',
          lastMessageAt: '2026-10-29T07:44:08.382Z',
        },
      ],
    });
  });

  it('keeps two people who share a name apart', async () => {
    mocks.listMostRecentUnipileChats.mockResolvedValue([
      {
        id: 'chat-1',
        name: 'Alex',
        is_group: false,
        is_1to1: true,
        user: { id: '33622222222@s.whatsapp.net', display_name: 'Alex' },
      },
      {
        id: 'chat-2',
        name: 'Alex',
        is_group: false,
        is_1to1: true,
        user: { id: '33633333333@s.whatsapp.net', display_name: 'Alex' },
      },
    ]);

    await expect(listChats()).resolves.toMatchObject({
      chats: [{ chatIds: ['chat-1'] }, { chatIds: ['chat-2'] }],
    });
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

  it('refuses a member without a WhatsApp connection', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await expect(listChats()).rejects.toThrow(
      'Connect your WhatsApp account first.',
    );
    expect(mocks.listMostRecentUnipileChats).not.toHaveBeenCalled();
  });
});
