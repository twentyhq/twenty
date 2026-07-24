import { describe, expect, it } from 'vitest';

import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';

const buildMentionBody = (overrides: Record<string, unknown> = {}) => ({
  type: 'event_callback',
  event_id: 'Ev123',
  team_id: 'T123',
  event: {
    type: 'app_mention',
    user: 'U123',
    text: '<@UBOT> create an invoice for ACME',
    ts: '1700000000.000100',
    channel: 'C123',
    ...overrides,
  },
});

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

  it('should keep other user mentions when stripping the leading bot mention', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({
        text: '<@UBOT> ask <@UALICE> about the ACME deal',
      }),
    );

    expect(result.request?.requestText).toBe(
      'ask <@UALICE> about the ACME deal',
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

  it('should skip a mention with no remaining text', () => {
    const result = parseSlackAssistantRequest(
      buildMentionBody({ text: '<@UBOT>' }),
    );

    expect(result.request).toBeNull();
  });

  it('should skip non event_callback bodies', () => {
    const result = parseSlackAssistantRequest({
      type: 'url_verification',
      challenge: 'challenge-token',
    });

    expect(result.request).toBeNull();
  });
});
