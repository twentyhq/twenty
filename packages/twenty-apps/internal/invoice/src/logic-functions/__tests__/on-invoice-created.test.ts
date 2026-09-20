import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock } = vi.hoisted(() => ({ mutationMock: vi.fn() }));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock };
  }),
}));

import onInvoiceCreated from '../on-invoice-created';

const INVOICE_ID = '11111111-1111-1111-1111-111111111111';

const handler = onInvoiceCreated.config.handler as (
  batch: unknown,
) => Promise<void>;

beforeEach(() => {
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('on-invoice-created', () => {
  it('is scoped to invoice.created', () => {
    expect(onInvoiceCreated.success).toBe(true);
    expect(onInvoiceCreated.config.databaseEventTriggerSettings).toEqual({
      eventName: 'invoice.created',
      batchMode: true,
    });
  });

  it('derives and writes tax type when both fields are present', async () => {
    await handler({
      events: [
        {
          recordId: INVOICE_ID,
          properties: {
            after: {
              id: INVOICE_ID,
              sellerState: 'Tamil Nadu',
              placeOfSupply: 'Karnataka',
              taxType: null,
            },
          },
        },
      ],
    });

    expect(mutationMock.mock.calls[0][0].createInvoices.__args).toEqual({
      data: [{ id: INVOICE_ID, taxType: 'INTER_STATE' }],
      upsert: true,
    });
  });

  it('skips the write when taxType already matches', async () => {
    await handler({
      events: [
        {
          recordId: INVOICE_ID,
          properties: {
            after: {
              id: INVOICE_ID,
              sellerState: 'Tamil Nadu',
              placeOfSupply: 'Tamil Nadu',
              taxType: 'INTRA_STATE',
            },
          },
        },
      ],
    });

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('skips the write when either field is missing', async () => {
    await handler({
      events: [
        {
          recordId: INVOICE_ID,
          properties: {
            after: { id: INVOICE_ID, sellerState: null, placeOfSupply: null },
          },
        },
      ],
    });

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
