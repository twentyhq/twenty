import { describe, expect, it } from 'vitest';

import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

const CHANNEL_HANDLE = '+33611111111';

const GRACE = {
  id: '199912345678901@lid',
  display_name: 'Grace',
  public_identifier: '33622222222',
  specifics: { contact_name: 'Grace Hopper' },
};

const GRACE_COUNTERPART = { user: GRACE, handle: '+33622222222' };

const buildMessage = (
  overrides: Partial<UnipileMessage> = {},
): UnipileMessage => ({
  id: 'message-1',
  chat_id: 'chat-1',
  sender_id: GRACE.id,
  sender: GRACE,
  text: 'Hello',
  timestamp: '2026-10-28T10:00:00.000Z',
  is_sender: false,
  is_deleted: false,
  is_event: false,
  provider: 'whatsapp',
  ...overrides,
});

describe('mapUnipileMessageToIngestMessage', () => {
  it('maps a received message from the sender to the channel, under the name the member saved', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage(),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [],
      }),
    ).toEqual({
      externalId: 'message-1',
      threadExternalId: 'chat-1',
      text: 'Hello',
      receivedAt: new Date('2026-10-28T10:00:00.000Z'),
      participants: [
        { role: 'FROM', handle: '+33622222222', displayName: 'Grace Hopper' },
        { role: 'TO', handle: CHANNEL_HANDLE },
      ],
    });
  });

  it('maps a sent message from the channel to the chat counterparts', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({ is_sender: true, sender: undefined }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [GRACE_COUNTERPART],
      })?.participants,
    ).toEqual([
      { role: 'FROM', handle: CHANNEL_HANDLE },
      { role: 'TO', handle: '+33622222222', displayName: 'Grace Hopper' },
    ]);
  });

  it('addresses a message received in a group to the other members too', () => {
    const sam = { id: '33633333333@s.whatsapp.net', display_name: 'Sam' };

    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage(),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [
          GRACE_COUNTERPART,
          { user: sam, handle: '+33633333333' },
        ],
      })?.participants,
    ).toEqual([
      { role: 'FROM', handle: '+33622222222', displayName: 'Grace Hopper' },
      { role: 'TO', handle: CHANNEL_HANDLE },
      { role: 'TO', handle: '+33633333333', displayName: 'Sam' },
    ]);
  });

  it('finds the sender among the chat counterparts when the message carries only their id', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({ sender: undefined }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [GRACE_COUNTERPART],
      })?.participants[0],
    ).toEqual({
      role: 'FROM',
      handle: '+33622222222',
      displayName: 'Grace Hopper',
    });
  });

  it('reads the phone number of a sender id when nothing else is known', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({
          sender: undefined,
          sender_id: '33633333333@s.whatsapp.net',
        }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [],
      })?.participants[0],
    ).toEqual({ role: 'FROM', handle: '+33633333333' });
  });

  it('skips a message whose sender hides their phone number', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({
          sender: { ...GRACE, public_identifier: undefined },
        }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [],
      }),
    ).toBeNull();
  });

  it('keeps attachment-only messages with an empty text', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({ text: undefined }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [],
      })?.text,
    ).toBe('');
  });

  it.each([{ is_event: true }, { is_deleted: true }])(
    'skips %o messages',
    (overrides) => {
      expect(
        mapUnipileMessageToIngestMessage({
          message: buildMessage(overrides),
          channelHandle: CHANNEL_HANDLE,
          counterparts: [],
        }),
      ).toBeNull();
    },
  );
});
