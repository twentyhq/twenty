import { render, screen } from '@testing-library/react';
import { MessageParticipantRole } from 'twenty-shared/types';

import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

const SENDER = {
  id: 'sender-id',
  role: MessageParticipantRole.FROM,
  displayName: 'Ada Lovelace',
  handle: 'ada@example.com',
} as EmailThreadMessageParticipant;

const buildMessage = (
  overrides: Partial<EmailThreadMessageWithSender>,
): EmailThreadMessageWithSender =>
  ({
    id: 'message-id',
    text: 'I came across your recent article',
    receivedAt: null,
    subject: 'Hello',
    headerMessageId: 'header-message-id',
    messageThreadId: 'thread-id',
    isDraft: false,
    messageParticipants: [SENDER],
    sender: SENDER,
    ...overrides,
  }) as EmailThreadMessageWithSender;

describe('EmailThreadMessage', () => {
  it('renders the message body when no recipient is readable', () => {
    render(
      <EmailThreadMessage
        message={buildMessage({})}
        isExpanded
        onDraftClick={jest.fn()}
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(
      screen.getByText('I came across your recent article'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^to:/)).not.toBeInTheDocument();
  });

  it('renders the message body when the sender is not readable', () => {
    render(
      <EmailThreadMessage
        message={buildMessage({ sender: undefined, messageParticipants: [] })}
        isExpanded
        onDraftClick={jest.fn()}
      />,
    );

    expect(screen.getByText('Unknown sender')).toBeInTheDocument();
    expect(
      screen.getByText('I came across your recent article'),
    ).toBeInTheDocument();
  });
});
