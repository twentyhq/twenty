import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { enrichRecord } from '../utils/enrich-record';
import { type queryCompanyEnrich } from '../utils/companyenrich-client';

const RECORD_ID = 'cdd6d6f1-7713-49dd-ae62-cf2a4976d919';
const UPDATED_AT = '2026-01-01T00:00:00.000Z';

const createClient = (kind: 'company' | 'person') => ({
  query: vi.fn().mockResolvedValue({
    [kind === 'company' ? 'companies' : 'people']: {
      edges: [
        {
          node: {
            id: RECORD_ID,
            updatedAt: UPDATED_AT,
            domainName: { primaryLinkUrl: 'example.com' },
            emails: { primaryEmail: 'jane@example.com' },
          },
        },
      ],
    },
  }),
  mutation: vi.fn().mockResolvedValue({
    [kind === 'company' ? 'updateCompanies' : 'updatePeople']: [
      { id: RECORD_ID },
    ],
  }),
});

describe('CRM enrichment', () => {
  it.each(['company', 'person'] as const)(
    'reads the %s first and only saves dedicated fields with a stale-record guard',
    async (kind) => {
      const client = createClient(kind);
      const query = vi.fn<typeof queryCompanyEnrich>().mockResolvedValue({
        success: true,
        data: {
          id: 'provider-profile-id',
          industry: 'Software',
          employees: '11-50',
          position: 'Engineer',
          department: 'Engineering',
        },
        creditsConsumed: 1,
      });
      const result = await enrichRecord(
        kind,
        { recordId: RECORD_ID },
        client as unknown as CoreApiClient,
        query,
      );
      expect(client.query.mock.invocationCallOrder[0]).toBeLessThan(
        query.mock.invocationCallOrder[0],
      );
      expect(query).toHaveBeenCalledWith(
        kind === 'company' ? 'enrich-company' : 'lookup-person',
        kind === 'company'
          ? { domain: 'example.com' }
          : { body: { email: 'jane@example.com' } },
      );
      const update =
        client.mutation.mock.calls[0][0][
          kind === 'company' ? 'updateCompanies' : 'updatePeople'
        ];
      expect(update.__args.filter).toEqual({
        id: { eq: RECORD_ID },
        updatedAt: { eq: UPDATED_AT },
      });
      expect(
        Object.keys(update.__args.data).every((field) =>
          field.startsWith('companyenrich'),
        ),
      ).toBe(true);
      expect(update.__args.data.companyenrichData.id).toBe(
        'provider-profile-id',
      );
      expect(result.updatedFields).toHaveLength(5);
      expect(result.creditsConsumed).toBe(1);
    },
  );

  it('does not spend credits when a record is outside the permitted workspace', async () => {
    const client = createClient('company');
    client.query.mockResolvedValue({ companies: { edges: [] } });
    const query = vi.fn<typeof queryCompanyEnrich>();
    await expect(
      enrichRecord(
        'company',
        { recordId: RECORD_ID },
        client as unknown as CoreApiClient,
        query,
      ),
    ).rejects.toThrow('access denied');
    expect(query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('does not overwrite a record edited while the provider was processing', async () => {
    const client = createClient('person');
    client.mutation.mockResolvedValue({ updatePeople: [] });
    const query = vi
      .fn<typeof queryCompanyEnrich>()
      .mockResolvedValue({ success: true, data: { id: '9007199254740993' } });
    await expect(
      enrichRecord(
        'person',
        { recordId: RECORD_ID },
        client as unknown as CoreApiClient,
        query,
      ),
    ).rejects.toThrow('record changed');
    expect(query).toHaveBeenCalledTimes(1);
    expect(client.mutation).toHaveBeenCalledTimes(1);
  });

  it('does not write anything after a failed provider request', async () => {
    const client = createClient('company');
    const query = vi
      .fn<typeof queryCompanyEnrich>()
      .mockRejectedValue(new Error('No match'));
    await expect(
      enrichRecord(
        'company',
        { recordId: RECORD_ID },
        client as unknown as CoreApiClient,
        query,
      ),
    ).rejects.toThrow('No match');
    expect(client.mutation).not.toHaveBeenCalled();
  });
});
