import { parseSlackWebhookBody } from 'src/engine/core-modules/slack-assistant/utils/parse-slack-webhook-body.util';

describe('parseSlackWebhookBody', () => {
  it('classifies a url_verification handshake', () => {
    const payload = parseSlackWebhookBody(
      JSON.stringify({ type: 'url_verification', challenge: 'challenge-token' }),
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
        event_id: 'Ev123',
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
      eventId: 'Ev123',
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
