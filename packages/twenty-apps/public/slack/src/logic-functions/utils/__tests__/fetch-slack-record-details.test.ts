import { describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { fetchSlackRecordDetails } from 'src/logic-functions/utils/fetch-slack-record-details';

const OPPORTUNITY_ID = '20202020-89ab-4cde-8f01-234567890abc';
const COMPANY_ID = '20202020-1234-4abc-9def-567890abcdef';

const buildReference = (
  objectNameSingular: string,
  recordId: string,
): SlackRecordReference => ({
  objectNameSingular,
  recordId,
  recordName: 'Some record',
  recordUrl: `https://acme.twenty.com/object/${objectNameSingular}/${recordId}`,
});

const buildClient = (
  queryMock: ReturnType<typeof vi.fn>,
): CoreApiClient => ({ query: queryMock }) as unknown as CoreApiClient;

describe('fetchSlackRecordDetails', () => {
  it('should resolve formatted fields for an opportunity', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      opportunities: {
        edges: [
          {
            node: {
              id: OPPORTUNITY_ID,
              stage: 'NEW_LEAD',
              amount: { amountMicros: 12500000000, currencyCode: 'USD' },
              closeDate: '2099-01-05T00:00:00.000Z',
            },
          },
        ],
      },
    });

    const details = await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('opportunity', OPPORTUNITY_ID),
    ]);

    expect(details.get(OPPORTUNITY_ID)).toEqual({
      fields: [
        { label: 'Stage', value: 'New lead' },
        { label: 'Amount', value: '$12,500' },
        { label: 'Close date', value: 'Jan 5, 2099' },
      ],
    });
    expect(queryMock).toHaveBeenCalledExactlyOnceWith({
      opportunities: expect.objectContaining({
        __args: {
          filter: { id: { in: [OPPORTUNITY_ID] } },
          first: 1,
        },
      }),
    });
  });

  it('should resolve a favicon image for a company with a domain', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      companies: {
        edges: [
          {
            node: {
              id: COMPANY_ID,
              domainName: { primaryLinkUrl: 'https://acme.com' },
              annualRevenue: null,
            },
          },
        ],
      },
    });

    const details = await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('company', COMPANY_ID),
    ]);

    expect(details.get(COMPANY_ID)).toEqual({
      fields: [{ label: 'Domain', value: 'https://acme.com' }],
      imageUrl: 'https://www.google.com/s2/favicons?domain=acme.com&sz=64',
    });
  });

  it('should batch references of one object into a single query', async () => {
    const queryMock = vi.fn().mockResolvedValue({ companies: { edges: [] } });

    await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('company', COMPANY_ID),
      buildReference('company', OPPORTUNITY_ID),
    ]);

    expect(queryMock).toHaveBeenCalledExactlyOnceWith({
      companies: expect.objectContaining({
        __args: {
          filter: { id: { in: [COMPANY_ID, OPPORTUNITY_ID] } },
          first: 2,
        },
      }),
    });
  });

  it('should skip objects without a detail config', async () => {
    const queryMock = vi.fn();

    const details = await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('customRocket', COMPANY_ID),
    ]);

    expect(queryMock).not.toHaveBeenCalled();
    expect(details.size).toBe(0);
  });

  it('should not render a zero amount when amountMicros is null', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      opportunities: {
        edges: [
          {
            node: {
              id: OPPORTUNITY_ID,
              stage: 'PROPOSAL',
              amount: { amountMicros: null, currencyCode: 'USD' },
              closeDate: null,
            },
          },
        ],
      },
    });

    const details = await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('opportunity', OPPORTUNITY_ID),
    ]);

    expect(details.get(OPPORTUNITY_ID)).toEqual({
      fields: [{ label: 'Stage', value: 'Proposal' }],
    });
  });

  it('should resolve relation fields for a person', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      people: {
        edges: [
          {
            node: {
              id: COMPANY_ID,
              jobTitle: 'CTO',
              emails: { primaryEmail: 'jane@acme.com' },
              company: { name: 'Acme Corp' },
            },
          },
        ],
      },
    });

    const details = await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('person', COMPANY_ID),
    ]);

    expect(details.get(COMPANY_ID)).toEqual({
      fields: [
        { label: 'Role', value: 'CTO' },
        { label: 'Email', value: 'jane@acme.com' },
        { label: 'Company', value: 'Acme Corp' },
      ],
    });
  });

  it('should return no details when the query fails', async () => {
    const queryMock = vi.fn().mockRejectedValue(new Error('boom'));

    const details = await fetchSlackRecordDetails(buildClient(queryMock), [
      buildReference('company', COMPANY_ID),
    ]);

    expect(details.size).toBe(0);
  });
});
