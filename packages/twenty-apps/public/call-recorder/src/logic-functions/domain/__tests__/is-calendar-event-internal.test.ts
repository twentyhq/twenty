import { describe, expect, it } from 'vitest';

import { isCalendarEventInternal } from 'src/logic-functions/domain/is-calendar-event-internal.util';
import { type CalendarEventParticipant } from 'src/logic-functions/types/calendar-event-participant.type';

const isInternal = ({
  participants,
  hasUnlistedParticipants = false,
  ownerHandle = 'ada@acme.com',
}: {
  participants: CalendarEventParticipant[];
  hasUnlistedParticipants?: boolean;
  ownerHandle?: string;
}) =>
  isCalendarEventInternal({
    participants,
    hasUnlistedParticipants,
    ownerHandle,
  });

describe('isCalendarEventInternal', () => {
  it('is internal when every participant is a workspace member', () => {
    expect(
      isInternal({
        participants: [
          { handle: 'ada@acme.com', isWorkspaceMember: true },
          { handle: 'grace@other-brand.com', isWorkspaceMember: true },
        ],
      }),
    ).toBe(true);
  });

  it('is internal when the other participants share the owner domain', () => {
    expect(
      isInternal({
        participants: [
          { handle: 'ada@acme.com', isWorkspaceMember: true },
          { handle: 'Linus@ACME.com', isWorkspaceMember: false },
        ],
      }),
    ).toBe(true);
  });

  it('is internal when nobody else is invited', () => {
    expect(isInternal({ participants: [] })).toBe(true);
  });

  it('is external when a participant is from another domain', () => {
    expect(
      isInternal({
        participants: [
          { handle: 'ada@acme.com', isWorkspaceMember: true },
          { handle: 'buyer@customer.com', isWorkspaceMember: false },
        ],
      }),
    ).toBe(false);
  });

  it('ignores a participant with no address', () => {
    expect(
      isInternal({
        participants: [{ handle: undefined, isWorkspaceMember: false }],
      }),
    ).toBe(true);
  });

  it('ignores a booked Google meeting room', () => {
    expect(
      isInternal({
        participants: [
          { handle: 'ada@acme.com', isWorkspaceMember: true },
          {
            handle: 'c_1883abc@resource.calendar.google.com',
            isWorkspaceMember: false,
          },
        ],
      }),
    ).toBe(true);
  });

  it.each([
    ['ada@gmail.com', 'buyer@gmail.com'],
    ['ada@hotmail.fr', 'buyer@hotmail.fr'],
    ['ada@seznam.cz', 'buyer@seznam.cz'],
    ['Ada@GMAIL.com', 'buyer@gmail.com'],
  ])(
    'does not treat the free-mail domain of %s as the workspace',
    (ownerHandle, participantHandle) => {
      expect(
        isInternal({
          ownerHandle,
          participants: [
            { handle: participantHandle, isWorkspaceMember: false },
          ],
        }),
      ).toBe(false);
    },
  );

  it('counts the owner as internal on a free-mail address', () => {
    expect(
      isInternal({
        ownerHandle: 'ada@gmail.com',
        participants: [{ handle: 'Ada@gmail.com', isWorkspaceMember: false }],
      }),
    ).toBe(true);
  });

  it('is external when some participants could not be listed', () => {
    expect(
      isInternal({
        hasUnlistedParticipants: true,
        participants: [{ handle: 'ada@acme.com', isWorkspaceMember: true }],
      }),
    ).toBe(false);
  });
});
