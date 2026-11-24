import { type IngestMessageParticipant } from 'twenty-sdk/logic-function';
import { describe, expect, it } from 'vitest';

import { limitWhatsappMessageParticipants } from 'src/logic-functions/utils/limit-whatsapp-message-participants.util';

const CHANNEL_HANDLE = '+33611111111';

const buildMembers = (count: number): IngestMessageParticipant[] =>
  Array.from({ length: count }, (_, index) => ({
    role: 'TO',
    handle: `+336${String(index).padStart(8, '0')}`,
  }));

describe('limitWhatsappMessageParticipants', () => {
  it('keeps every participant of a group Twenty accepts whole', () => {
    const participants: IngestMessageParticipant[] = [
      { role: 'FROM', handle: CHANNEL_HANDLE },
      ...buildMembers(255),
    ];

    expect(
      limitWhatsappMessageParticipants({
        participants,
        channelHandle: CHANNEL_HANDLE,
      }),
    ).toBe(participants);
  });

  it('keeps the sender, the member and the people in Twenty of a larger group', () => {
    const members = buildMembers(400);
    const personInTwenty = { ...members[399], personId: 'person-id' };
    const sender: IngestMessageParticipant = {
      role: 'FROM',
      handle: '+33622222222',
    };

    const limitedParticipants = limitWhatsappMessageParticipants({
      participants: [
        ...members.slice(0, 399),
        personInTwenty,
        { role: 'TO', handle: CHANNEL_HANDLE },
        sender,
      ],
      channelHandle: CHANNEL_HANDLE,
    });

    expect(limitedParticipants).toHaveLength(256);
    expect(limitedParticipants.slice(0, 3)).toEqual([
      { role: 'TO', handle: CHANNEL_HANDLE },
      sender,
      personInTwenty,
    ]);
  });
});
