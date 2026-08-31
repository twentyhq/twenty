import { render, screen } from '@testing-library/react';

import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

const NOW = new Date('2026-08-31T12:00:00.000Z');
const TWO_HOURS_BEFORE_NOW = '2026-08-31T10:00:00.000Z';

const SENDER = {
  id: 'sender-id',
  displayName: 'Ada Lovelace',
  handle: 'ada@example.com',
} as EmailThreadMessageParticipant;

describe('EmailThreadMessageSender', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the sender without a timestamp when the message has no received date', () => {
    render(<EmailThreadMessageSender sender={SENDER} sentAt={null} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
  });

  it('renders the received date relative to now', () => {
    render(
      <EmailThreadMessageSender
        sender={SENDER}
        sentAt={TWO_HOURS_BEFORE_NOW}
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('about 2 hours ago')).toBeInTheDocument();
  });
});
