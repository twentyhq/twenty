import { describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { fetchSlackRecordCardFieldLines } from 'src/logic-functions/utils/fetch-slack-record-card-field-lines';

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

describe('fetchSlackRecordCardFieldLines', () => {
  it('should resolve formatted field lines for an opportunity', async () => {
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

    const fieldLines = await fetchSlackRecordCardFieldLines(
      buildClient(queryMock),
      [buildReference('opportunity', OPPORTUNITY_ID)],
    );

    expect(fieldLines.get(OPPORTUNITY_ID)).toEqual([
      'Stage: New lead',
      'Amount: $12,500',
      'Close date: Jan 5, 2099',
    ]);
    expect(queryMock).toHaveBeenCalledExactlyOnceWith({
      opportunities: expect.objectContaining({
        __args: {
          filter: { id: { in: [OPPORTUNITY_ID] } },
          first: 1,
        },
      }),
    });
  });

  it('should batch references of one object into a single query', async () => {
    const queryMock = vi.fn().mockResolvedValue({ companies: { edges: [] } });

    await fetchSlackRecordCardFieldLines(buildClient(queryMock), [
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

  it('should skip objects without a card field config', async () => {
    const queryMock = vi.fn();

    const fieldLines = await fetchSlackRecordCardFieldLines(
      buildClient(queryMock),
      [buildReference('customRocket', COMPANY_ID)],
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(fieldLines.size).toBe(0);
  });

  it('should drop empty field values instead of rendering blank lines', async () => {
    const queryMock = vi.fn().mockResolvedValue({
      companies: {
        edges: [
          {
            node: {
              id: COMPANY_ID,
              domainName: { primaryLinkUrl: '' },
              annualRevenue: null,
            },
          },
        ],
      },
    });

    const fieldLines = await fetchSlackRecordCardFieldLines(
      buildClient(queryMock),
      [buildReference('company', COMPANY_ID)],
    );

    expect(fieldLines.get(COMPANY_ID)).toEqual([]);
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

    const fieldLines = await fetchSlackRecordCardFieldLines(
      buildClient(queryMock),
      [buildReference('opportunity', OPPORTUNITY_ID)],
    );

    expect(fieldLines.get(OPPORTUNITY_ID)).toEqual(['Stage: Proposal']);
  });

  it('should resolve company and relation fields for a person', async () => {
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

    const fieldLines = await fetchSlackRecordCardFieldLines(
      buildClient(queryMock),
      [buildReference('person', COMPANY_ID)],
    );

    expect(fieldLines.get(COMPANY_ID)).toEqual([
      'Role: CTO',
      'Email: jane@acme.com',
      'Company: Acme Corp',
    ]);
  });

  it('should return no field lines when the query fails', async () => {
    const queryMock = vi.fn().mockRejectedValue(new Error('boom'));

    const fieldLines = await fetchSlackRecordCardFieldLines(
      buildClient(queryMock),
      [buildReference('company', COMPANY_ID)],
    );

    expect(fieldLines.size).toBe(0);
  });
});
