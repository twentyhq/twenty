import { describe, expect, it } from 'vitest';

import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

const CHANNEL_HANDLE = 'linkedin.com/in/me';

const buildMessage = (overrides: Partial<UnipileMessage> = {}): UnipileMessage => ({
  id: 'message-1',
  chat_id: 'chat-1',
  sender_id: 'ACoGRACE',
  sender: {
    id: 'ACoGRACE',
    display_name: 'Grace Hopper',
    public_identifier: 'grace-hopper',
  },
  text: 'Hello',
  timestamp: '2026-10-28T10:00:00.000Z',
  is_sender: false,
  is_deleted: false,
  is_event: false,
  provider: 'linkedin',
  ...overrides,
});

describe('mapUnipileMessageToIngestMessage', () => {
  it('maps a received message from the sender to the channel', () => {
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
        {
          role: 'FROM',
          handle: 'https://www.linkedin.com/in/grace-hopper',
          displayName: 'Grace Hopper',
        },
        { role: 'TO', handle: CHANNEL_HANDLE },
      ],
    });
  });

  it('maps a sent message from the channel to the chat counterparts', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({ is_sender: true, sender: undefined }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [
          {
            id: 'ACoGRACE',
            display_name: 'Grace Hopper',
            public_identifier: 'grace-hopper',
          },
        ],
      })?.participants,
    ).toEqual([
      { role: 'FROM', handle: CHANNEL_HANDLE },
      {
        role: 'TO',
        handle: 'https://www.linkedin.com/in/grace-hopper',
        displayName: 'Grace Hopper',
      },
    ]);
  });

  it('falls back to the sender id when the sender profile is missing', () => {
    expect(
      mapUnipileMessageToIngestMessage({
        message: buildMessage({ sender: undefined }),
        channelHandle: CHANNEL_HANDLE,
        counterparts: [],
      })?.participants[0],
    ).toEqual({
      role: 'FROM',
      handle: 'https://www.linkedin.com/in/ACoGRACE',
    });
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
