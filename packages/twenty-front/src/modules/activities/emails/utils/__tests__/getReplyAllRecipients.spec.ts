import { type EmailReplyMessage } from '@/activities/emails/types/EmailReplyMessage';
import { type EmailReplyParticipant } from '@/activities/emails/types/EmailReplyParticipant';
import { getReplyAllRecipients } from '@/activities/emails/utils/getReplyAllRecipients';
import { MessageParticipantRole } from 'twenty-shared/types';

const buildParticipant = ({
  role,
  handle,
  displayName = '',
}: {
  role: MessageParticipantRole;
  handle: string;
  displayName?: string;
}): EmailReplyParticipant => ({ role, handle, displayName });

const buildMessage = (
  participants: EmailReplyParticipant[],
): EmailReplyMessage => ({
  sender: participants.find(
    (participant) => participant.role === MessageParticipantRole.FROM,
  ),
  messageParticipants: participants,
});

const CONNECTED_ACCOUNT_HANDLE = 'me@company.com';

describe('getReplyAllRecipients', () => {
  it('returns null when the only other participant is the sender', () => {
    const message = buildMessage([
      buildParticipant({
        role: MessageParticipantRole.FROM,
        handle: 'alice@example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.TO,
        handle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ]);

    expect(
      getReplyAllRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBeNull();
  });

  it('addresses the sender and other To recipients, keeping Cc recipients in Cc', () => {
    const message = buildMessage([
      buildParticipant({
        role: MessageParticipantRole.FROM,
        handle: 'alice@example.com',
        displayName: 'Alice',
      }),
      buildParticipant({
        role: MessageParticipantRole.TO,
        handle: CONNECTED_ACCOUNT_HANDLE,
      }),
      buildParticipant({
        role: MessageParticipantRole.TO,
        handle: 'bob@example.com',
        displayName: 'Bob',
      }),
      buildParticipant({
        role: MessageParticipantRole.CC,
        handle: 'carol@example.com',
        displayName: 'Carol',
      }),
      buildParticipant({
        role: MessageParticipantRole.BCC,
        handle: 'dan@example.com',
        displayName: 'Dan',
      }),
    ]);

    expect(
      getReplyAllRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toEqual({
      to: 'Alice <alice@example.com>, Bob <bob@example.com>',
      cc: 'Carol <carol@example.com>',
    });
  });

  it('uses the Reply-To address in place of the sender', () => {
    const message = buildMessage([
      buildParticipant({
        role: MessageParticipantRole.FROM,
        handle: 'no-reply@example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.REPLY_TO,
        handle: 'support@example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.TO,
        handle: CONNECTED_ACCOUNT_HANDLE,
      }),
      buildParticipant({
        role: MessageParticipantRole.CC,
        handle: 'carol@example.com',
      }),
    ]);

    expect(
      getReplyAllRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toEqual({
      to: 'support@example.com',
      cc: 'carol@example.com',
    });
  });

  it('returns null on your own message, where Reply already reaches every recipient', () => {
    const message = buildMessage([
      buildParticipant({
        role: MessageParticipantRole.FROM,
        handle: CONNECTED_ACCOUNT_HANDLE,
      }),
      buildParticipant({
        role: MessageParticipantRole.TO,
        handle: 'bob@example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.CC,
        handle: 'carol@example.com',
      }),
    ]);

    expect(
      getReplyAllRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBeNull();
  });

  it('does not repeat in Cc an address already in To', () => {
    const message = buildMessage([
      buildParticipant({
        role: MessageParticipantRole.FROM,
        handle: 'alice@example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.TO,
        handle: 'bob@example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.CC,
        handle: 'Alice@Example.com',
      }),
      buildParticipant({
        role: MessageParticipantRole.CC,
        handle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ]);

    expect(
      getReplyAllRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toEqual({
      to: 'alice@example.com, bob@example.com',
      cc: '',
    });
  });
});
