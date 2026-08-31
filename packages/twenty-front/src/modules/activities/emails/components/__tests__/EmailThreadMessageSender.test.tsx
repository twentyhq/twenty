import { render, screen } from '@testing-library/react';

import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

jest.mock('@/activities/components/ParticipantChip', () => ({
  ParticipantChip: ({
    participant,
  }: {
    participant: EmailThreadMessageParticipant;
  }) => <span>{participant.displayName}</span>,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ localeCatalog: {} }),
}));

jest.mock('twenty-ui/surfaces', () => ({
  AppTooltip: ({ content }: { content: string }) => (
    <span role="tooltip">{content}</span>
  ),
  TooltipPosition: { Top: 'top' },
}));

jest.mock('~/utils/date-utils', () => ({
  beautifyPastDateRelativeToNow: () => 'Relative date',
  formatToHumanReadableDate: () => 'Human-readable date',
}));

const SENDER = {
  id: 'sender-id',
  displayName: 'Sender Name',
  handle: 'sender@example.com',
} as EmailThreadMessageParticipant;

describe('EmailThreadMessageSender', () => {
  it('should keep rendering the sender when the received date is missing', () => {
    render(<EmailThreadMessageSender sender={SENDER} sentAt={null} />);

    expect(screen.getByText('Sender Name')).toBeInTheDocument();
    expect(screen.queryByText('Relative date')).not.toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should render the received date and tooltip when available', () => {
    render(
      <EmailThreadMessageSender
        sender={SENDER}
        sentAt="2026-08-31T12:00:00.000Z"
      />,
    );

    expect(screen.getByText('Relative date')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Human-readable date',
    );
  });
});
