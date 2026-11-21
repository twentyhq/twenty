import { describe, expect, it } from 'vitest';

import { buildPostbackMessage } from 'src/logic-functions/data/build-postback-message.util';
import { getMessengerEventJobKey } from 'src/logic-functions/data/get-messenger-event-job-key.util';

const BASE_EVENT = {
  sender: { id: 'customer-1' },
  recipient: { id: 'page-1' },
  timestamp: 100,
};

describe('buildPostbackMessage', () => {
  it('shows the title of the tapped button', () => {
    expect(
      buildPostbackMessage({
        ...BASE_EVENT,
        postback: { mid: 'm-1', title: 'Talk to sales', payload: 'SALES' },
      }),
    ).toEqual({ mid: 'm-1', text: '[Tapped] Talk to sales' });
  });

  it('identifies a postback without mid by its sender and time', () => {
    const event = { ...BASE_EVENT, postback: { payload: 'GET_STARTED' } };

    expect(buildPostbackMessage(event)).toEqual({
      mid: 'postback:customer-1:100',
      text: '[Tapped] GET_STARTED',
    });
    expect(getMessengerEventJobKey(event)).toBe('postback:customer-1:100');
  });
});
