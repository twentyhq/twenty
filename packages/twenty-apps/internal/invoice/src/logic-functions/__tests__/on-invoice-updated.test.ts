import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock } = vi.hoisted(() => ({ mutationMock: vi.fn() }));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock };
  }),
}));

import onInvoiceUpdated from '../on-invoice-updated';

const INVOICE_ID = '22222222-2222-2222-2222-222222222222';

const handler = onInvoiceUpdated.config.handler as (
  batch: unknown,
) => Promise<void>;

beforeEach(() => {
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('on-invoice-updated', () => {
  it('is scoped to sellerState/placeOfSupply changes only, so it cannot re-trigger itself', () => {
    expect(onInvoiceUpdated.success).toBe(true);
    expect(onInvoiceUpdated.config.databaseEventTriggerSettings).toEqual({
      eventName: 'invoice.updated',
      updatedFields: ['sellerState', 'placeOfSupply'],
      batchMode: true,
    });
  });

  it('re-derives tax type when the states now match', async () => {
    await handler({
      events: [
        {
          recordId: INVOICE_ID,
          properties: {
            after: {
              id: INVOICE_ID,
              sellerState: 'Kerala',
              placeOfSupply: 'Kerala',
              taxType: 'INTER_STATE',
            },
          },
        },
      ],
    });

    expect(mutationMock.mock.calls[0][0].createInvoices.__args).toEqual({
      data: [{ id: INVOICE_ID, taxType: 'INTRA_STATE' }],
      upsert: true,
    });
  });
});
