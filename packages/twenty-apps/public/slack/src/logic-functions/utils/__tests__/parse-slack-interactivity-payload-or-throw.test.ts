import { describe, expect, it } from 'vitest';

import { parseSlackInteractivityPayloadOrThrow } from 'src/logic-functions/utils/parse-slack-interactivity-payload-or-throw';

describe('parseSlackInteractivityPayloadOrThrow', () => {
  it('should parse the JSON payload field of the form-encoded body', () => {
    const payload = {
      type: 'block_actions',
      team: { id: 'T0123456789' },
      actions: [
        {
          action_id: 'slack-assistant-feedback',
          block_id: '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
          value: 'positive_feedback',
        },
      ],
    };

    expect(
      parseSlackInteractivityPayloadOrThrow({
        payload: JSON.stringify(payload),
      }),
    ).toEqual(payload);
  });

  it('should throw when the body has no payload field', () => {
    expect(() => parseSlackInteractivityPayloadOrThrow({})).toThrow(
      'Slack interactivity request has no payload field',
    );
    expect(() => parseSlackInteractivityPayloadOrThrow(null)).toThrow(
      'Slack interactivity request has no payload field',
    );
  });

  it('should throw when the payload field is not valid JSON', () => {
    expect(() =>
      parseSlackInteractivityPayloadOrThrow({ payload: 'not-json' }),
    ).toThrow('Slack interactivity payload is not valid JSON');
  });

  it('should throw when the payload JSON has an unexpected shape', () => {
    expect(() =>
      parseSlackInteractivityPayloadOrThrow({ payload: '"a string"' }),
    ).toThrow('Slack interactivity payload has an unexpected shape');
    expect(() =>
      parseSlackInteractivityPayloadOrThrow({
        payload: JSON.stringify({ type: 'block_actions', actions: 'no' }),
      }),
    ).toThrow('Slack interactivity payload has an unexpected shape');
    expect(() =>
      parseSlackInteractivityPayloadOrThrow({
        payload: JSON.stringify({ team: { id: 42 } }),
      }),
    ).toThrow('Slack interactivity payload has an unexpected shape');
  });
});
