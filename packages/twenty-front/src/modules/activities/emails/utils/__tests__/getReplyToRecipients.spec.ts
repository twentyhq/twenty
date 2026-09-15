import { getReplyToRecipients } from '@/activities/emails/utils/getReplyToRecipients';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
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
): EmailThreadMessageWithSender => {
  const sender =
    participants.find(
      (participant) => participant.role === MessageParticipantRole.FROM,
    ) ?? participants[0];

  return {
    sender,
    messageParticipants: participants,
  } as unknown as EmailThreadMessageWithSender;
};

const CONNECTED_ACCOUNT_HANDLE = 'me@company.com';

describe('getReplyToRecipients', () => {
  it('replies to the original sender when someone else sent the message', () => {
    const message = buildMessage([
      buildParticipant(
        MessageParticipantRole.FROM,
        'alice@example.com',
        'Alice',
      ),
      buildParticipant(MessageParticipantRole.TO, CONNECTED_ACCOUNT_HANDLE),
    ]);

    expect(
      getReplyToRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBe('Alice <alice@example.com>');
  });

  it('prefers the Reply-To address over the sender when one is set', () => {
    const message = buildMessage([
      buildParticipant(MessageParticipantRole.FROM, 'no-reply@example.com'),
      buildParticipant(
        MessageParticipantRole.REPLY_TO,
        'support@example.com',
        'Support',
      ),
      buildParticipant(MessageParticipantRole.TO, CONNECTED_ACCOUNT_HANDLE),
    ]);

    expect(
      getReplyToRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBe('Support <support@example.com>');
  });

  it('replies to the original TO and CC recipients when replying to your own message', () => {
    const message = buildMessage([
      buildParticipant(MessageParticipantRole.FROM, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com', 'Bob'),
      buildParticipant(MessageParticipantRole.CC, 'carol@example.com', 'Carol'),
      buildParticipant(MessageParticipantRole.BCC, 'dan@example.com', 'Dan'),
    ]);

    expect(
      getReplyToRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBe('Bob <bob@example.com>, Carol <carol@example.com>');
  });

  it('excludes the connected account own address from the recipients', () => {
    const message = buildMessage([
      buildParticipant(MessageParticipantRole.FROM, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com', 'Bob'),
    ]);

    expect(
      getReplyToRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBe('Bob <bob@example.com>');
  });

  it('deduplicates an address present in both To and Cc case-insensitively', () => {
    const message = buildMessage([
      buildParticipant(MessageParticipantRole.FROM, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com', 'Bob'),
      buildParticipant(MessageParticipantRole.CC, 'Bob@Example.com', 'Bob'),
    ]);

    expect(
      getReplyToRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBe('Bob <bob@example.com>');
  });

  it('ignores participants without a handle', () => {
    const message = buildMessage([
      buildParticipant(MessageParticipantRole.FROM, CONNECTED_ACCOUNT_HANDLE),
      buildParticipant(MessageParticipantRole.TO, '', 'Ghost'),
      buildParticipant(MessageParticipantRole.TO, 'bob@example.com', 'Bob'),
    ]);

    expect(
      getReplyToRecipients({
        message,
        connectedAccountHandle: CONNECTED_ACCOUNT_HANDLE,
      }),
    ).toBe('Bob <bob@example.com>');
  });
});
