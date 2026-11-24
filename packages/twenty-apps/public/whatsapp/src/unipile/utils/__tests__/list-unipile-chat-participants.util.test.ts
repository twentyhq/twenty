import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE } from 'src/constants/unipile-chat-participants-page-size.constant';

const mocks = vi.hoisted(() => ({ getParticipantsList: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileMessaging: class {
    getParticipantsList = mocks.getParticipantsList;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({}),
}));

vi.mock('src/unipile/utils/request-unipile.util', () => ({
  requestUnipile: async (
    _label: string,
    request: () => Promise<{ data: unknown }>,
  ) => request(),
}));

const { listUnipileChatParticipants } =
  await import('src/unipile/utils/list-unipile-chat-participants.util');

const buildParticipants = ({
  count,
  firstIndex = 0,
}: {
  count: number;
  firstIndex?: number;
}) =>
  Array.from({ length: count }, (_, index) => ({
    is_self: false,
    user: { id: `user-${firstIndex + index}`, display_name: '' },
  }));

const listParticipants = () =>
  listUnipileChatParticipants({ accountId: 'acc_1', chatId: 'chat-1' });

const requestedQueries = () =>
  mocks.getParticipantsList.mock.calls.map(([options]) => options.query);

describe('listUnipileChatParticipants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads a small group in one request', async () => {
    mocks.getParticipantsList.mockResolvedValue({
      data: { data: buildParticipants({ count: 3 }) },
    });

    await expect(listParticipants()).resolves.toHaveLength(3);
    expect(mocks.getParticipantsList).toHaveBeenCalledOnce();
  });

  it('follows the cursor of a provider that pages by cursor', async () => {
    mocks.getParticipantsList
      .mockResolvedValueOnce({
        data: { data: buildParticipants({ count: 2 }), next_cursor: 'next' },
      })
      .mockResolvedValueOnce({
        data: { data: buildParticipants({ count: 1, firstIndex: 2 }) },
      });

    await expect(listParticipants()).resolves.toHaveLength(3);
    expect(requestedQueries()).toEqual([
      { limit: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE, offset: 0 },
      { limit: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE, cursor: 'next' },
    ]);
  });

  it('moves the offset of a provider that returns full pages without a cursor', async () => {
    mocks.getParticipantsList
      .mockResolvedValueOnce({
        data: {
          data: buildParticipants({
            count: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE,
          }),
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: buildParticipants({
            count: 1,
            firstIndex: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE,
          }),
        },
      });

    await expect(listParticipants()).resolves.toHaveLength(
      UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE + 1,
    );
    expect(requestedQueries()[1]).toEqual({
      limit: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE,
      offset: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE,
    });
  });

  it('stops when a provider keeps returning the same page', async () => {
    mocks.getParticipantsList.mockResolvedValue({
      data: {
        data: buildParticipants({ count: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE }),
      },
    });

    await expect(listParticipants()).resolves.toHaveLength(
      UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE,
    );
    expect(mocks.getParticipantsList).toHaveBeenCalledTimes(2);
  });
});
