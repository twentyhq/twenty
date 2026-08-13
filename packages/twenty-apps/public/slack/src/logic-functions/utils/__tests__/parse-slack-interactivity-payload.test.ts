import { describe, expect, it } from 'vitest';

import { parseSlackInteractivityPayload } from 'src/logic-functions/utils/parse-slack-interactivity-payload';

describe('parseSlackInteractivityPayload', () => {
  it('should parse the JSON payload field of the form-encoded body', () => {
    const payload = {
      type: 'block_actions',
      team: { id: 'T0123456789' },
      actions: [{ action_id: 'slack-assistant-feedback' }],
    };

    expect(
      parseSlackInteractivityPayload({ payload: JSON.stringify(payload) }),
    ).toEqual(payload);
  });

  it('should throw when the body has no payload field', () => {
    expect(() => parseSlackInteractivityPayload({})).toThrow(
      'Slack interactivity request has no payload field',
    );
    expect(() => parseSlackInteractivityPayload(null)).toThrow(
      'Slack interactivity request has no payload field',
    );
  });

  it('should throw when the payload field is not valid JSON', () => {
    expect(() =>
      parseSlackInteractivityPayload({ payload: 'not-json' }),
    ).toThrow('Slack interactivity payload is not valid JSON');
  });
});
