import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonLastContactAtIfNewer } from 'src/utils/update-person-last-contact-at';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const LAST_CONTACT_AT = '2026-06-01T10:00:00.000Z';

describe('updatePersonLastContactAtIfNewer', () => {
  it('should update lastContactAt only when the value is newer or unset', async () => {
    const mutationMock = vi.fn().mockResolvedValue({ updatePeople: [] });
    const client = { mutation: mutationMock } as unknown as CoreApiClient;

    await updatePersonLastContactAtIfNewer(client, PERSON_ID, LAST_CONTACT_AT);

    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updatePeople: {
        __args: {
          data: { lastContactAt: LAST_CONTACT_AT },
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
});
