import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getEmailDraftPrefillFromMessage } from '@/activities/emails/utils/getEmailDraftPrefillFromMessage';
import { MessageParticipantRole } from 'twenty-shared/types';

const buildDraftMessage = (text: string): EmailThreadMessageWithSender =>
  ({
    id: 'draft-message-id',
    subject: 'Your payment did not go through',
    text,
    messageParticipants: [
      {
        role: MessageParticipantRole.FROM,
        handle: 'marie@twenty.com',
        displayName: 'Marie',
      },
      {
        role: MessageParticipantRole.TO,
        handle: 'pedro@example.com',
        displayName: 'Pedro',
      },
    ],
  }) as unknown as EmailThreadMessageWithSender;

describe('getEmailDraftPrefillFromMessage', () => {
  it('keeps the line breaks of the synced draft text in the composer body', () => {
    const prefill = getEmailDraftPrefillFromMessage(
      buildDraftMessage('Hi,\n\nThe payment failed.\n\nBest,\nMarie'),
    );

    const document = JSON.parse(prefill.body);

    expect(document.type).toBe('doc');
    expect(document.content[0].content).toEqual([
      { type: 'text', text: 'Hi,' },
      { type: 'hardBreak' },
      { type: 'hardBreak' },
      { type: 'text', text: 'The payment failed.' },
      { type: 'hardBreak' },
      { type: 'hardBreak' },
      { type: 'text', text: 'Best,' },
      { type: 'hardBreak' },
      { type: 'text', text: 'Marie' },
    ]);
  });

  it('prefills recipients and subject from the draft', () => {
    const prefill = getEmailDraftPrefillFromMessage(buildDraftMessage('Hi'));

    expect(prefill.messageId).toBe('draft-message-id');
    expect(prefill.subject).toBe('Your payment did not go through');
    expect(prefill.to).toContain('pedro@example.com');
    expect(prefill.cc).toBe('');
  });
});
