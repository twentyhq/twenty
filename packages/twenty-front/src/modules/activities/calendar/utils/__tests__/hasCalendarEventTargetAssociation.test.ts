import { hasCalendarEventTargetAssociation } from '@/activities/calendar/utils/hasCalendarEventTargetAssociation';

describe('hasCalendarEventTargetAssociation', () => {
  it('requires invitations to preserve the provider participant', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendeeEmails: ['person@example.com'],
        requiredAttendee: 'person@example.com',
        sendInvitations: false,
      }),
    ).toBe(false);
  });

  it('requires the current record email in the attendee list', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendeeEmails: ['someone-else@example.com'],
        requiredAttendee: 'person@example.com',
        sendInvitations: true,
      }),
    ).toBe(false);
  });

  it('matches the current record email case-insensitively', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendeeEmails: ['Person@Example.com'],
        requiredAttendee: 'person@example.com',
        sendInvitations: true,
      }),
    ).toBe(true);
  });
});
