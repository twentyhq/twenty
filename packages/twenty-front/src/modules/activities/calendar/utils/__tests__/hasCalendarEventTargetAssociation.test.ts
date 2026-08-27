import { hasCalendarEventTargetAssociation } from '@/activities/calendar/utils/hasCalendarEventTargetAssociation';

describe('hasCalendarEventTargetAssociation', () => {
  it('requires invitations to preserve the provider participant', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendees: [{ address: 'person@example.com' }],
        relatedPersonIds: [],
        requiredAttendee: 'person@example.com',
        sendInvitations: false,
      }),
    ).toBe(false);
  });

  it('requires the current record email in the attendee list', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendees: [{ address: 'someone-else@example.com' }],
        relatedPersonIds: [],
        requiredAttendee: 'person@example.com',
        sendInvitations: true,
      }),
    ).toBe(false);
  });

  it('matches the current record email case-insensitively', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendees: [{ address: 'Person@Example.com' }],
        relatedPersonIds: [],
        requiredAttendee: 'person@example.com',
        sendInvitations: true,
      }),
    ).toBe(true);
  });

  it('accepts another person related to the timeline record', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendees: [
          {
            address: 'another-employee@example.com',
            personId: 'related-person-id',
          },
        ],
        relatedPersonIds: ['related-person-id'],
        requiredAttendee: 'first-employee@example.com',
        sendInvitations: true,
      }),
    ).toBe(true);
  });

  it('rejects a person unrelated to the timeline record', () => {
    expect(
      hasCalendarEventTargetAssociation({
        attendees: [
          {
            address: 'someone-else@example.com',
            personId: 'unrelated-person-id',
          },
        ],
        relatedPersonIds: ['related-person-id'],
        requiredAttendee: 'first-employee@example.com',
        sendInvitations: true,
      }),
    ).toBe(false);
  });
});
