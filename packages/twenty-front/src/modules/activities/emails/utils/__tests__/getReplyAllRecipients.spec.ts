import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getReplyAllRecipients } from '@/activities/emails/utils/getReplyAllRecipients';
import { MessageParticipantRole } from 'twenty-shared/types';

const buildParticipant = (
  role: MessageParticipantRole,
  handle: string,
  displayName = '',
): EmailThreadMessageParticipant =>
  ({
    role,
    handle,
    displayName,
  }) as EmailThreadMessageParticipant;

const buildMessage = (
  participants: EmailThreadMessageParticipant[],
): Pick<EmailThreadMessageWithSender, 'sender' | 'messageParticipants'> => ({
  sender: participants.find(
    (participant) => participant.role === MessageParticipantRole.FROM,
  ),
  messageParticipants: participants,
});

const CONNECTED_ACCOUNT_HANDLE = 'me@company.com';

describe('getReplyAllRecipients', () => {
  it('returns null when the only other participant is the sender', () => {
    const message = buildMessage([
      buildParticipant(MessageParticipantRole.FROM, 'alice@example.com'),
      buildParticipant(MessageParticipantRole.TO, CONNECTED_ACCOUNT_HANDLE),
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
      buildParticipant(
        MessageParticipantRole.FROM,
        'alice@example.com',
        'Alice',
      ),
      buildParticipant(MessageParticipantRole.TO, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com', 'Bob'),
      buildParticipant(MessageParticipantRole.CC, 'carol@example.com', 'Carol'),
      buildParticipant(MessageParticipantRole.BCC, 'dan@example.com', 'Dan'),
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
      buildParticipant(MessageParticipantRole.FROM, 'no-reply@example.com'),
      buildParticipant(MessageParticipantRole.REPLY_TO, 'support@example.com'),
      buildParticipant(MessageParticipantRole.TO, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.CC, 'carol@example.com'),
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
      buildParticipant(MessageParticipantRole.FROM, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com'),
      buildParticipant(MessageParticipantRole.CC, 'carol@example.com'),
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
      buildParticipant(MessageParticipantRole.FROM, 'alice@example.com'),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com'),
      buildParticipant(MessageParticipantRole.CC, 'Alice@Example.com'),
      buildParticipant(MessageParticipantRole.CC, CONNECTED_ACCOUNT_HANDLE),
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
