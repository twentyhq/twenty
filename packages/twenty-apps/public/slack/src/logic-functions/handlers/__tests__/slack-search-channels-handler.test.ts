import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackSearchChannelsHandler } from 'src/logic-functions/handlers/slack-search-channels-handler';

const {
  currentUserHasRolesPermissionMock,
  getSlackClientMock,
  conversationsListMock,
} = vi.hoisted(() => ({
  currentUserHasRolesPermissionMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  conversationsListMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/current-user-has-roles-permission', () => ({
  currentUserHasRolesPermission: currentUserHasRolesPermissionMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const ENG = { id: 'C0ENG', name: 'eng', is_private: false, is_member: true };
const FINANCE = {
  id: 'C0FIN',
  name: 'finance',
  is_private: true,
  is_member: false,
};
const ENGINEERING_LEADS = {
  id: 'C0LEAD',
  name: 'engineering-leads',
  is_private: true,
  is_member: true,
};

const buildPayload = (query: unknown) => ({ body: { query } });

describe('slackSearchChannelsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasRolesPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { conversations: { list: conversationsListMock } },
    });
    conversationsListMock.mockResolvedValue({
      channels: [ENG, FINANCE, ENGINEERING_LEADS],
      response_metadata: { next_cursor: '' },
    });
  });

  it('should refuse when the user lacks the roles permission', async () => {
    currentUserHasRolesPermissionMock.mockResolvedValue(false);

    const result = await slackSearchChannelsHandler(buildPayload('eng'));

    expect(result.success).toBe(false);
    expect(conversationsListMock).not.toHaveBeenCalled();
  });

  it('should return no channels for an empty query without calling Slack', async () => {
    const result = await slackSearchChannelsHandler(buildPayload('  '));

    expect(result).toEqual({ success: true, slackChannels: [] });
    expect(conversationsListMock).not.toHaveBeenCalled();
  });

  it('should fail when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'No Slack connection',
    });

    const result = await slackSearchChannelsHandler(buildPayload('eng'));

    expect(result).toEqual({
      success: false,
      message: 'Slack is not connected',
      error: 'No Slack connection',
    });
  });

  it('should match channel names case-insensitively and ignore a leading hash', async () => {
    const result = await slackSearchChannelsHandler(buildPayload('#ENG'));

    expect(result).toEqual({
      success: true,
      slackChannels: [
        {
          slackChannelId: 'C0ENG',
          name: 'eng',
          isPrivate: false,
          isMember: true,
        },
        {
          slackChannelId: 'C0LEAD',
          name: 'engineering-leads',
          isPrivate: true,
          isMember: true,
        },
      ],
    });
    expect(conversationsListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        types: 'public_channel,private_channel',
        exclude_archived: true,
      }),
    );
  });

  it('should follow the cursor to later pages until it runs out', async () => {
    conversationsListMock
      .mockResolvedValueOnce({
        channels: [ENG],
        response_metadata: { next_cursor: 'page-2' },
      })
      .mockResolvedValueOnce({
        channels: [FINANCE],
        response_metadata: { next_cursor: '' },
      });

    const result = await slackSearchChannelsHandler(buildPayload('fin'));

    expect(result).toEqual({
      success: true,
      slackChannels: [
        {
          slackChannelId: 'C0FIN',
          name: 'finance',
          isPrivate: true,
          isMember: false,
        },
      ],
    });
    expect(conversationsListMock).toHaveBeenCalledTimes(2);
    expect(conversationsListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'page-2' }),
    );
  });

  it('should keep following the cursor past the first pages until Slack exhausts the list', async () => {
    const pages = Array.from({ length: 6 }, (_, index) => ({
      channels: [ENG],
      response_metadata: { next_cursor: index < 5 ? `page-${index + 2}` : '' },
    }));

    for (const page of pages) {
      conversationsListMock.mockResolvedValueOnce(page);
    }

    const result = await slackSearchChannelsHandler(
      buildPayload('nothing-matches'),
    );

    expect(result).toEqual({ success: true, slackChannels: [] });
    expect(conversationsListMock).toHaveBeenCalledTimes(6);
    expect(conversationsListMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 1000 }),
    );
  });

  it('should stop once it has enough matches without reading further pages', async () => {
    conversationsListMock.mockResolvedValue({
      channels: Array.from({ length: 12 }, (_, index) => ({
        id: `C${index}`,
        name: `eng-${index}`,
      })),
      response_metadata: { next_cursor: 'more' },
    });

    const result = await slackSearchChannelsHandler(buildPayload('eng'));

    expect(result.success).toBe(true);
    expect(result.success && result.slackChannels).toHaveLength(10);
    expect(conversationsListMock).toHaveBeenCalledTimes(1);
  });

  it('should stop reading pages after the page bound even if Slack keeps returning a cursor', async () => {
    conversationsListMock.mockResolvedValue({
      channels: [ENG],
      response_metadata: { next_cursor: 'more' },
    });

    await slackSearchChannelsHandler(buildPayload('nothing-matches'));

    expect(conversationsListMock).toHaveBeenCalledTimes(20);
  });

  it('should fail with a structured result when Slack errors', async () => {
    conversationsListMock.mockRejectedValue(new Error('ratelimited'));

    const result = await slackSearchChannelsHandler(buildPayload('eng'));

    expect(result).toEqual({
      success: false,
      message: 'Could not search Slack channels',
      error: 'ratelimited',
    });
  });
});
