import { parseSlackWebhookBody } from 'src/engine/core-modules/slack-assistant/utils/parse-slack-webhook-body.util';

describe('parseSlackWebhookBody', () => {
  it('classifies a url_verification handshake', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'url_verification',
        challenge: 'challenge-token',
      }),
    );

    expect(payload).toEqual({
      kind: 'url_verification',
      challenge: 'challenge-token',
    });
  });

  it('classifies an app_mention event and extracts the thread/team/user', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'app_mention',
          channel: 'C1',
          ts: '1700000000.000100',
          text: 'hey <@U0BOT> hello',
          user: 'U1',
        },
      }),
    );

    expect(payload).toMatchObject({
      kind: 'app_mention',
      channelId: 'C1',
      threadTs: '1700000000.000100',
      text: 'hey <@U0BOT> hello',
      teamId: 'T123',
      userId: 'U1',
    });
  });

  it('prefers an explicit thread_ts over the message ts', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'app_mention',
          channel: 'C1',
          ts: '1700000000.000100',
          thread_ts: '1699999999.000001',
          text: 'reply in thread',
        },
      }),
    );

    expect(payload).toMatchObject({ threadTs: '1699999999.000001' });
  });

  it('classifies a direct message and surfaces botId/subtype so the controller can drop echoes', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel_type: 'im',
          channel: 'D1',
          ts: '1700000000.000100',
          text: 'the bot talking to itself',
          bot_id: 'B1',
          subtype: 'bot_message',
        },
      }),
    );

    expect(payload).toMatchObject({
      kind: 'direct_message',
      botId: 'B1',
      subtype: 'bot_message',
    });
  });

  it('classifies a user-originated direct message without botId/subtype', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel_type: 'im',
          channel: 'D2',
          ts: '1700000000.000100',
          text: 'hey assistant',
          user: 'U2',
        },
      }),
    );

    expect(payload).toMatchObject({
      kind: 'direct_message',
      channelId: 'D2',
      threadTs: '1700000000.000100',
      ts: '1700000000.000100',
      text: 'hey assistant',
      teamId: 'T123',
      userId: 'U2',
      botId: undefined,
      subtype: undefined,
    });
  });

  it('falls back to the enterprise_id from the envelope when the event omits team_id', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        enterprise_id: 'E123',
        event: {
          type: 'app_mention',
          channel: 'C1',
          ts: '1700000000.000100',
          text: 'grid message',
        },
      }),
    );

    expect(payload).toMatchObject({ enterpriseId: 'E123' });
  });

  it('classifies a threaded channel reply as a channel_message', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel_type: 'channel',
          channel: 'C1',
          ts: '1700000001.000200',
          thread_ts: '1700000000.000100',
          text: 'follow-up without a mention',
          user: 'U1',
        },
      }),
    );

    expect(payload).toMatchObject({
      kind: 'channel_message',
      channelId: 'C1',
      threadTs: '1700000000.000100',
      ts: '1700000001.000200',
      text: 'follow-up without a mention',
    });
  });

  it('classifies a threaded private-channel (group) reply as a channel_message', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel_type: 'group',
          channel: 'G1',
          ts: '1700000001.000200',
          thread_ts: '1700000000.000100',
          text: 'private follow-up',
        },
      }),
    );

    expect(payload).toMatchObject({
      kind: 'channel_message',
      channelId: 'G1',
      threadTs: '1700000000.000100',
    });
  });

  it('surfaces botId/subtype on a threaded channel reply so the controller can drop the assistant echo', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel_type: 'channel',
          channel: 'C1',
          ts: '1700000002.000300',
          thread_ts: '1700000000.000100',
          text: 'the assistant reply echoing back',
          bot_id: 'B1',
        },
      }),
    );

    expect(payload).toMatchObject({
      kind: 'channel_message',
      botId: 'B1',
    });
  });

  it('returns unsupported for a top-level channel message with no thread_ts', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel_type: 'channel',
          channel: 'C1',
          ts: '1700000000.000100',
          text: 'top-level channel chatter',
        },
      }),
    );

    expect(payload).toEqual({ kind: 'unsupported' });
  });

  it('returns unsupported for a non-message event type', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        event: { type: 'reaction_added' },
      }),
    );

    expect(payload).toEqual({ kind: 'unsupported' });
  });

  it('returns unsupported for a channel message that is not a DM or mention', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({
        type: 'event_callback',
        event: { type: 'message', channel_type: 'channel', text: 'hi' },
      }),
    );

    expect(payload).toEqual({ kind: 'unsupported' });
  });

  it('returns unsupported for a non-JSON body instead of throwing', () => {
    expect(parseSlackWebhookBody('not json')).toEqual({ kind: 'unsupported' });
  });

  it('returns unsupported for a JSON array body', () => {
    expect(parseSlackWebhookBody('[]')).toEqual({ kind: 'unsupported' });
  });
});
