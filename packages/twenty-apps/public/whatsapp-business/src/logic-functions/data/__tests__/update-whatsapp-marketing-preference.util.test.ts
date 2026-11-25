import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateWhatsAppMarketingPreference } from 'src/logic-functions/data/update-whatsapp-marketing-preference.util';

const query = vi.fn();
const mutation = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = query;
    mutation = mutation;
  },
}));

vi.mock('src/logic-functions/data/find-or-create-whatsapp-person-id.util', () => ({
  findOrCreateWhatsAppPersonId: vi.fn(async () => 'person-id'),
}));

const UPDATED_AT = new Date('2026-11-20T10:00:00.000Z');

const mockPreviousUpdatedAt = (previousUpdatedAt: string | null) =>
  query.mockResolvedValue({ person: { whatsAppMarketingPreferenceUpdatedAt: previousUpdatedAt } });

describe('updateWhatsAppMarketingPreference', () => {
  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
  });

  it('should record an opt-out with its time', async () => {
    mockPreviousUpdatedAt(null);

    await updateWhatsAppMarketingPreference({
      identity: { whatsAppId: '16505551234' },
      isOptedOut: true,
      updatedAt: UPDATED_AT,
    });

    expect(mutation).toHaveBeenCalledWith({
      updatePerson: {
        __args: {
          id: 'person-id',
          data: {
            whatsAppMarketingOptOut: true,
            whatsAppMarketingPreferenceUpdatedAt: UPDATED_AT.toISOString(),
          },
        },
        id: true,
      },
    });
  });

  it('should ignore a preference older than the one already recorded', async () => {
    mockPreviousUpdatedAt('2026-11-20T11:00:00.000Z');

    await updateWhatsAppMarketingPreference({
      identity: { whatsAppUserId: 'US.1' },
      isOptedOut: false,
      updatedAt: UPDATED_AT,
    });

    expect(mutation).not.toHaveBeenCalled();
  });

  it('should do nothing without any identifier', async () => {
    await updateWhatsAppMarketingPreference({ identity: {}, isOptedOut: true, updatedAt: UPDATED_AT });

    expect(query).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });
});
