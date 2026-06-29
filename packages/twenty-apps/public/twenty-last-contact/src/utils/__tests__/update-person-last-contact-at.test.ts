import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonLastContactIfNewer } from 'src/utils/update-person-last-contact-at';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const LAST_CONTACT_AT = '2026-06-01T10:00:00.000Z';

describe('updatePersonLastContactIfNewer', () => {
  it('should set all fields for a message item, guarded by the newer-than filter', async () => {
    const mutationMock = vi.fn().mockResolvedValue({ updatePeople: [] });
    const client = { mutation: mutationMock } as unknown as CoreApiClient;

    await updatePersonLastContactIfNewer(client, {
      personId: PERSON_ID,
      lastContactAt: LAST_CONTACT_AT,
      workspaceMemberId: MEMBER_ID,
      item: { type: 'message', id: MESSAGE_ID },
    });

    expect(mutationMock).toHaveBeenCalledWith({
      updatePeople: {
        __args: {
          data: {
            lastContactAt: LAST_CONTACT_AT,
            lastContactById: MEMBER_ID,
            lastContactItemMessageId: MESSAGE_ID,
            lastContactItemCalendarEventId: null,
          },
          filter: {
            and: [
              { id: { eq: PERSON_ID } },
              {
                or: [
                  { lastContactAt: { is: 'NULL' } },
                  { lastContactAt: { lt: LAST_CONTACT_AT } },
                ],
              },
            ],
          },
        },
        id: true,
      },
    });
  });

  it('should set the calendarEvent join column and null the message one', async () => {
    const mutationMock = vi.fn().mockResolvedValue({ updatePeople: [] });
    const client = { mutation: mutationMock } as unknown as CoreApiClient;

    await updatePersonLastContactIfNewer(client, {
      personId: PERSON_ID,
      lastContactAt: LAST_CONTACT_AT,
      workspaceMemberId: null,
      item: { type: 'calendarEvent', id: CALENDAR_EVENT_ID },
    });

    const data = mutationMock.mock.calls[0][0].updatePeople.__args.data;
    expect(data).toEqual({
      lastContactAt: LAST_CONTACT_AT,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      lastContactItemMessageId: null,
    });
  });

  it('should omit lastContactById when no team member is known', async () => {
    const mutationMock = vi.fn().mockResolvedValue({ updatePeople: [] });
    const client = { mutation: mutationMock } as unknown as CoreApiClient;

    await updatePersonLastContactIfNewer(client, {
      personId: PERSON_ID,
      lastContactAt: LAST_CONTACT_AT,
      workspaceMemberId: null,
      item: { type: 'message', id: MESSAGE_ID },
    });

    const data = mutationMock.mock.calls[0][0].updatePeople.__args.data;
    expect('lastContactById' in data).toBe(false);
  });
});
