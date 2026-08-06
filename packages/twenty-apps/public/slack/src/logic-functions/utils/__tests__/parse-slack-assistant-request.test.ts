import { describe, expect, it } from 'vitest';

import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';

const buildMentionBody = (
  eventOverrides: Record<string, unknown> = {},
  bodyOverrides: Record<string, unknown> = {},
) => ({
  type: 'event_callback',
  event_id: 'Ev123',
  team_id: 'T123',
  event: {
    type: 'app_mention',
    user: 'U123',
    text: '<@UBOT> create an invoice for ACME',
    ts: '1700000000.000100',
    channel: 'C123',
    ...eventOverrides,
  },
  ...bodyOverrides,
});

const BOT_AUTHORIZATIONS = [{ user_id: 'UBOT', is_bot: true }];

describe('parseSlackAssistantRequest', () => {
  it('should parse an app_mention and strip the bot mention', () => {
    const result = parseSlackAssistantRequest(buildMentionBody());

    expect(result).toEqual({
      request: {
        slackEventId: 'Ev123',
        slackChannelId: 'C123',
        slackChannelType: 'channel',
        slackThreadTimestamp: '',
        slackMessageTimestamp: '1700000000.000100',
        slackUserId: 'U123',
        requestText: 'create an invoice for ACME',
      },
      requiresActiveThreadSubscription: false,
    });
  });

  it('should keep other user mentions when stripping the bot mention', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({
        text: '<@UBOT> ask <@UALICE> about the ACME deal',
      }),
    );

    expect(result.request?.requestText).toBe(
      'ask <@UALICE> about the ACME deal',
    );
  });

  it('should strip a bot mention in the middle of the text', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody(
        { text: 'hey <@UBOT>, who owns ACME?' },
        { authorizations: BOT_AUTHORIZATIONS },
      ),
    );

    expect(result.request?.requestText).toBe('hey, who owns ACME?');
  });

  it('should strip the bot mention at the start and in the middle of the text', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody(
        { text: '<@UBOT> can <@UBOT> list open deals for ACME?' },
        { authorizations: BOT_AUTHORIZATIONS },
      ),
    );

    expect(result.request?.requestText).toBe('can list open deals for ACME?');
  });

  it('should strip a repeated bot mention using the leading mention when authorizations are missing', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({
        text: '<@UBOT> what does <@UBOT|twenty> know about ACME?',
      }),
    );

    expect(result.request?.requestText).toBe('what does know about ACME?');
  });

  it('should keep other user mentions when stripping a mid-text bot mention', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody(
        { text: 'hey <@UBOT> ask <@UALICE> about the ACME deal' },
        { authorizations: BOT_AUTHORIZATIONS },
      ),
    );

    expect(result.request?.requestText).toBe(
      'hey ask <@UALICE> about the ACME deal',
    );
  });

  it('should keep a leading other-user mention when the bot id is known', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody(
        { text: '<@UALICE> and <@UBOT> should review the ACME deal' },
        { authorizations: BOT_AUTHORIZATIONS },
      ),
    );

    expect(result.request?.requestText).toBe(
      '<@UALICE> and should review the ACME deal',
    );
  });

  it('should preserve user mentions on unmentioned thread follow-ups', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'EvFollowUp',
      event: {
        type: 'message',
        channel_type: 'channel',
        user: 'U123',
        text: 'what about <@UALICE>?',
        ts: '1700000000.000400',
        thread_ts: '1699999999.000001',
        channel: 'C123',
      },
    });

    expect(result).toEqual({
      request: {
        slackEventId: 'EvFollowUp',
        slackChannelId: 'C123',
        slackChannelType: 'channel',
        slackThreadTimestamp: '1699999999.000001',
        slackMessageTimestamp: '1700000000.000400',
        slackUserId: 'U123',
        requestText: 'what about <@UALICE>?',
      },
      requiresActiveThreadSubscription: true,
    });
  });

  it('should keep the thread timestamp when mentioned inside a thread', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({ thread_ts: '1699999999.000001' }),
    );

    expect(result.request?.slackThreadTimestamp).toBe('1699999999.000001');
  });

  it('should parse a direct message to the bot', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'Ev456',
      event: {
        type: 'message',
        channel_type: 'im',
        user: 'U123',
        text: 'how many open opportunities do we have?',
        ts: '1700000000.000200',
        channel: 'D123',
      },
    });

    expect(result.request).toEqual({
      slackEventId: 'Ev456',
      slackChannelId: 'D123',
      slackChannelType: 'im',
      slackThreadTimestamp: '',
      slackMessageTimestamp: '1700000000.000200',
      slackUserId: 'U123',
      requestText: 'how many open opportunities do we have?',
    });
  });

  it('should strip the bot mention from a direct message', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'Ev456',
      authorizations: BOT_AUTHORIZATIONS,
      event: {
        type: 'message',
        channel_type: 'im',
        user: 'U123',
        text: 'hey <@UBOT>, how many open opportunities do we have?',
        ts: '1700000000.000200',
        channel: 'D123',
      },
    });

    expect(result.request?.requestText).toBe(
      'hey, how many open opportunities do we have?',
    );
  });

  it('should keep mentions in a direct message when the bot id is unknown', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'Ev456',
      event: {
        type: 'message',
        channel_type: 'im',
        user: 'U123',
        text: 'ping <@UBOT> about the ACME deal',
        ts: '1700000000.000200',
        channel: 'D123',
      },
    });

    expect(result.request?.requestText).toBe('ping <@UBOT> about the ACME deal');
  });

  it('should skip messages sent by bots so the assistant never answers itself', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({ bot_id: 'B123' }),
    );

    expect(result.request).toBeNull();
  });

  it('should skip message subtypes such as edits', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({ subtype: 'message_changed' }),
    );

    expect(result.request).toBeNull();
  });

  it('should skip channel messages that are not mentions', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'Ev789',
      event: {
        type: 'message',
        channel_type: 'channel',
        user: 'U123',
        text: 'unrelated chatter',
        ts: '1700000000.000300',
        channel: 'C123',
      },
    });

    expect(result.request).toBeNull();
  });

  it('should flag a mention with no remaining text for a hint reply', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({ text: '<@UBOT>' }),
    );

    expect(result).toEqual({
      request: null,
      skipReason: 'Empty request text',
      emptyRequest: {
        slackChannelId: 'C123',
        slackMessageTimestamp: '1700000000.000100',
        parentMessageTimestamp: '1700000000.000100',
        isInExistingThread: false,
      },
    });
  });

  it('should target the existing thread when an empty mention is inside one', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({ text: '<@UBOT>', thread_ts: '1699999999.000001' }),
    );

    expect(result).toMatchObject({
      request: null,
      emptyRequest: {
        parentMessageTimestamp: '1699999999.000001',
        isInExistingThread: true,
      },
    });
  });

  it('should flag an empty direct message without a thread target', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'Ev456',
      event: {
        type: 'message',
        channel_type: 'im',
        user: 'U123',
        text: '   ',
        ts: '1700000000.000200',
        channel: 'D123',
      },
    });

    expect(result).toEqual({
      request: null,
      skipReason: 'Empty request text',
      emptyRequest: {
        slackChannelId: 'D123',
        slackMessageTimestamp: '1700000000.000200',
        parentMessageTimestamp: undefined,
        isInExistingThread: false,
      },
    });
  });

  it('should skip an empty unmentioned thread follow-up without a hint reply', () => {
    const result = parseSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'EvEmptyFollowUp',
      event: {
        type: 'message',
        channel_type: 'channel',
        user: 'U123',
        text: '',
        ts: '1700000000.000500',
        thread_ts: '1699999999.000001',
        channel: 'C123',
      },
    });

    expect(result).toEqual({
      request: null,
      skipReason: 'Empty request text',
    });
  });

  it('should skip non event_callback bodies', () => {
    const result = parseSlackAssistantRequest({
      type: 'url_verification',
      challenge: 'challenge-token',
    });

    expect(result.request).toBeNull();
  });
});
