import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { unfurlSlackRecordLinks } from 'src/logic-functions/utils/unfurl-slack-record-links';

const {
  fetchSlackRecordUnfurlCardMock,
  fetchWorkspaceBaseUrlMock,
  getSlackClientMock,
} = vi.hoisted(() => ({
  fetchSlackRecordUnfurlCardMock: vi.fn(),
  fetchWorkspaceBaseUrlMock: vi.fn(),
  getSlackClientMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/fetch-slack-record-unfurl-card', () => ({
  fetchSlackRecordUnfurlCard: fetchSlackRecordUnfurlCardMock,
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-url', () => ({
  fetchWorkspaceBaseUrl: fetchWorkspaceBaseUrlMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const RECORD_ID = '6b1e6a4b-5e3f-4c2d-9a8b-1f2e3d4c5b6a';
const RECORD_LINK_URL = `${WORKSPACE_BASE_URL}/object/opportunity/${RECORD_ID}`;

const buildLinkSharedBody = (linkUrls: string[]): SlackEventsRequestBody => ({
  type: 'event_callback',
  team_id: 'T123',
  event: {
    type: 'link_shared',
    channel: 'C123',
    message_ts: '1700000000.000100',
    links: linkUrls.map((url) => ({ url })),
  },
});

describe('unfurlSlackRecordLinks', () => {
  const chatUnfurlMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchWorkspaceBaseUrlMock.mockResolvedValue(WORKSPACE_BASE_URL);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { chat: { unfurl: chatUnfurlMock } },
    });
    fetchSlackRecordUnfurlCardMock.mockResolvedValue({
      recordTitle: 'Big deal',
      objectLabel: 'Opportunity',
      fields: [{ label: 'Stage', value: 'Proposal' }],
    });
    chatUnfurlMock.mockResolvedValue({ ok: true });
  });

  it('should unfurl a shared record link with a compact card', async () => {
    const result = await unfurlSlackRecordLinks(
      buildLinkSharedBody([RECORD_LINK_URL]),
    );

    expect(result).toEqual({ ok: true, unfurledLinkCount: 1 });
    expect(fetchSlackRecordUnfurlCardMock).toHaveBeenCalledWith({
      linkUrl: RECORD_LINK_URL,
      recordUrl: RECORD_LINK_URL,
      objectNameSingular: 'opportunity',
      recordId: RECORD_ID,
    });
    expect(chatUnfurlMock).toHaveBeenCalledWith({
      channel: 'C123',
      ts: '1700000000.000100',
      unfurls: {
        [RECORD_LINK_URL]: expect.objectContaining({
          blocks: expect.any(Array),
        }),
      },
    });
  });

  it('should skip non record links without calling Slack', async () => {
    const result = await unfurlSlackRecordLinks(
      buildLinkSharedBody([`${WORKSPACE_BASE_URL}/settings/profile`]),
    );

    expect(result.ok).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(fetchSlackRecordUnfurlCardMock).not.toHaveBeenCalled();
    expect(chatUnfurlMock).not.toHaveBeenCalled();
  });

  it('should skip silently when the record cannot be resolved', async () => {
    fetchSlackRecordUnfurlCardMock.mockResolvedValue(undefined);

    const result = await unfurlSlackRecordLinks(
      buildLinkSharedBody([RECORD_LINK_URL]),
    );

    expect(result.ok).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(chatUnfurlMock).not.toHaveBeenCalled();
  });

  it('should only unfurl resolvable links when several are shared', async () => {
    const otherLinkUrl = `${WORKSPACE_BASE_URL}/object/person/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee`;

    fetchSlackRecordUnfurlCardMock
      .mockResolvedValueOnce({
        recordTitle: 'Big deal',
        objectLabel: 'Opportunity',
        fields: [],
      })
      .mockResolvedValueOnce(undefined);

    const result = await unfurlSlackRecordLinks(
      buildLinkSharedBody([RECORD_LINK_URL, otherLinkUrl]),
    );

    expect(result).toEqual({ ok: true, unfurledLinkCount: 1 });
    expect(chatUnfurlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        unfurls: { [RECORD_LINK_URL]: expect.anything() },
      }),
    );
  });

  it('should skip when the workspace base url is unavailable', async () => {
    fetchWorkspaceBaseUrlMock.mockResolvedValue(undefined);

    const result = await unfurlSlackRecordLinks(
      buildLinkSharedBody([RECORD_LINK_URL]),
    );

    expect(result.ok).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(chatUnfurlMock).not.toHaveBeenCalled();
  });

  it('should report a failure when chat.unfurl rejects', async () => {
    chatUnfurlMock.mockRejectedValue(new Error('missing_scope'));

    const result = await unfurlSlackRecordLinks(
      buildLinkSharedBody([RECORD_LINK_URL]),
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('missing_scope');
  });
});
