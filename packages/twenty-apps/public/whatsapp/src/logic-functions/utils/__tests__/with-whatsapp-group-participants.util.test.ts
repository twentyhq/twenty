import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ listUnipileChatParticipants: vi.fn() }));

vi.mock('src/unipile/utils/list-unipile-chat-participants.util', () => ({
  listUnipileChatParticipants: mocks.listUnipileChatParticipants,
}));

const { withWhatsappGroupParticipants } =
  await import('src/logic-functions/utils/with-whatsapp-group-participants.util');

const MEMBER = {
  is_self: false,
  user: { id: '33622222222@s.whatsapp.net', display_name: 'Priya Nair' },
};

const GROUP_CHAT = {
  id: 'chat-1',
  name: 'Q4 hiring',
  is_group: true,
  is_1to1: false,
};

describe('withWhatsappGroupParticipants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listUnipileChatParticipants.mockResolvedValue([MEMBER]);
  });

  it('reads the members of a group Unipile returned without them', async () => {
    await expect(
      withWhatsappGroupParticipants({
        unipileAccountId: 'acc_1',
        chat: GROUP_CHAT,
        deadlineAtMs: 1000,
      }),
    ).resolves.toEqual({ ...GROUP_CHAT, participants: [MEMBER] });
    expect(mocks.listUnipileChatParticipants).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      deadlineAtMs: 1000,
    });
  });

  it('keeps the members Unipile returned with the group', async () => {
    const chat = { ...GROUP_CHAT, participants: [MEMBER] };

    await expect(
      withWhatsappGroupParticipants({ unipileAccountId: 'acc_1', chat }),
    ).resolves.toBe(chat);
    expect(mocks.listUnipileChatParticipants).not.toHaveBeenCalled();
  });

  it('asks nothing for a one-to-one chat', async () => {
    const chat = { ...GROUP_CHAT, is_group: false, is_1to1: true };

    await expect(
      withWhatsappGroupParticipants({ unipileAccountId: 'acc_1', chat }),
    ).resolves.toBe(chat);
    expect(mocks.listUnipileChatParticipants).not.toHaveBeenCalled();
  });
});
