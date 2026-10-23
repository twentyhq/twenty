import { parseSendAppMessageResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-send-app-message-result.util';

describe('parseSendAppMessageResult', () => {
  it('returns the trimmed external id with the send time', () => {
    expect(
      parseSendAppMessageResult({
        externalId: ' message-a ',
        sentAt: '2026-10-23T09:30:00.000Z',
      }),
    ).toEqual({
      isValid: true,
      sentMessage: {
        externalId: 'message-a',
        sentAt: '2026-10-23T09:30:00.000Z',
      },
    });
  });

  it('leaves the send time out when it is absent or null', () => {
    expect(
      parseSendAppMessageResult({ externalId: 'message-a', sentAt: null }),
    ).toEqual({ isValid: true, sentMessage: { externalId: 'message-a' } });
  });

  it.each([
    ['a missing result', undefined],
    ['a null result', null],
    ['a missing id', {}],
    ['a blank id', { externalId: '  ' }],
    ['an id over 512 characters', { externalId: 'a'.repeat(513) }],
    ['a send time that is not a date', { externalId: 'a', sentAt: 'today' }],
  ])('rejects %s', (_label, data) => {
    expect(parseSendAppMessageResult(data)).toEqual({
      isValid: false,
      reason: expect.any(String),
    });
  });
});
