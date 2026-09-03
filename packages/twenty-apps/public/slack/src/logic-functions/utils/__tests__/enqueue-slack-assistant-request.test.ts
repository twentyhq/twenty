import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

const { enqueueRecordMock, gateThreadFollowUpMock, replyToEmptyRequestMock } =
  vi.hoisted(() => ({
    enqueueRecordMock: vi.fn(),
    gateThreadFollowUpMock: vi.fn(),
    replyToEmptyRequestMock: vi.fn(),
  }));

vi.mock(
  'src/logic-functions/utils/enqueue-slack-assistant-request-record',
  () => ({ enqueueSlackAssistantRequestRecord: enqueueRecordMock }),
);

vi.mock('src/logic-functions/utils/gate-slack-thread-follow-up', () => ({
  gateSlackThreadFollowUp: gateThreadFollowUpMock,
}));

vi.mock(
  'src/logic-functions/utils/reply-to-empty-slack-assistant-request',
  () => ({ replyToEmptySlackAssistantRequest: replyToEmptyRequestMock }),
);

const buildAppMentionBody = (
  eventOverrides: Record<string, unknown> = {},
): SlackEventsRequestBody =>
  ({
    type: 'event_callback',
    event_id: 'Ev0DROPPED',
    team_id: 'T123',
    authorizations: [{ user_id: 'UBOT', is_bot: true }],
    event: {
      type: 'app_mention',
      channel: 'C0BU9DH47MH',
      channel_type: 'channel',
      user: 'U123',
      text: '<@UBOT> who owns ACME?',
      ts: '1788381325.822749',
      ...eventOverrides,
    },
  }) as SlackEventsRequestBody;

describe('enqueueSlackAssistantRequest', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gateThreadFollowUpMock.mockResolvedValue(undefined);
    enqueueRecordMock.mockResolvedValue({ ok: true });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should log the event id, type, message and reason when a mention is discarded', async () => {
    const result = await enqueueSlackAssistantRequest(
      buildAppMentionBody({ bot_id: 'B0APPPOSTED', subtype: 'bot_message' }),
    );

    expect(result).toEqual({
      ok: true,
      skipped:
        'Not a plain user message (bot_id=B0APPPOSTED, subtype=bot_message)',
    });
    expect(warnSpy).toHaveBeenCalledWith(
      '[slack] discarded event Ev0DROPPED (app_mention) in C0BU9DH47MH:1788381325.822749: Not a plain user message (bot_id=B0APPPOSTED, subtype=bot_message)',
    );
  });

  it('should log a mention that Slack delivered without an author', async () => {
    await enqueueSlackAssistantRequest(
      buildAppMentionBody({ user: undefined }),
    );

    expect(warnSpy).toHaveBeenCalledWith(
      '[slack] discarded event Ev0DROPPED (app_mention) in C0BU9DH47MH:1788381325.822749: Event is missing required fields: user',
    );
  });

  it('should log a channel message the assistant does not handle', async () => {
    await enqueueSlackAssistantRequest(
      buildAppMentionBody({ type: 'message' }),
    );

    expect(warnSpy).toHaveBeenCalledWith(
      '[slack] discarded event Ev0DROPPED (message) in C0BU9DH47MH:1788381325.822749: Unhandled event type: message',
    );
  });

  it('should log a discard decided downstream of the parser', async () => {
    enqueueRecordMock.mockResolvedValue({
      ok: true,
      skipped: 'Slack message is already queued',
    });

    await enqueueSlackAssistantRequest(buildAppMentionBody());

    expect(warnSpy).toHaveBeenCalledWith(
      '[slack] discarded event Ev0DROPPED (app_mention) in C0BU9DH47MH:1788381325.822749: Slack message is already queued',
    );
  });

  it('should log a thread follow-up dropped by the subscription gate', async () => {
    gateThreadFollowUpMock.mockResolvedValue({
      ok: true,
      skipped: 'Thread is not subscribed for unmentioned follow-ups',
    });

    await enqueueSlackAssistantRequest(
      buildAppMentionBody({
        type: 'message',
        thread_ts: '1788381000.000100',
        text: 'and last month?',
      }),
    );

    expect(warnSpy).toHaveBeenCalledWith(
      '[slack] discarded event Ev0DROPPED (message) in C0BU9DH47MH:1788381325.822749: Thread is not subscribed for unmentioned follow-ups',
    );
  });

  it('should not log when the mention is queued', async () => {
    const result = await enqueueSlackAssistantRequest(buildAppMentionBody());

    expect(result).toEqual({ ok: true });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
