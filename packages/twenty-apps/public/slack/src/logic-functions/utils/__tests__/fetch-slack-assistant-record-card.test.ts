import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSlackAssistantRecordCard } from 'src/logic-functions/utils/fetch-slack-assistant-record-card';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';

const queryMock = vi.fn();

const client = { query: queryMock } as unknown as CoreApiClient;

const buildResponseText = (objectNameSingular: string, recordId: string) =>
  `Found [ACME](${WORKSPACE_BASE_URL}/object/${objectNameSingular}/${recordId}).`;

describe('fetchSlackAssistantRecordCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build a card for the single record the answer links to', async () => {
    queryMock.mockResolvedValue({
      companies: {
        edges: [
          {
            node: {
              id: 'c-1',
              name: 'ACME',
              domainName: { primaryLinkUrl: 'https://www.acme.com/' },
              annualRevenue: {
                amountMicros: '1200000000000',
                currencyCode: 'USD',
              },
              address: { addressCity: 'Paris' },
            },
          },
        ],
      },
    });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toEqual({
      recordName: 'ACME',
      objectLabel: 'Company',
      recordUrl: `${WORKSPACE_BASE_URL}/object/company/c-1`,
      details: ['acme.com', '$1,200,000', 'Paris'],
    });
  });

  it('should read a person name, job title and company from the record', async () => {
    queryMock.mockResolvedValue({
      people: {
        edges: [
          {
            node: {
              id: 'p-1',
              name: { firstName: 'Ada', lastName: 'Lovelace' },
              jobTitle: 'CTO',
              emails: { primaryEmail: 'ada@acme.com' },
              company: { name: 'ACME' },
            },
          },
        ],
      },
    });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('person', 'p-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toEqual(
      expect.objectContaining({
        recordName: 'Ada Lovelace',
        objectLabel: 'Person',
        details: ['CTO', 'ACME', 'ada@acme.com'],
      }),
    );
  });

  it('should write opportunity field values the way a member reads them', async () => {
    queryMock.mockResolvedValue({
      opportunities: {
        edges: [
          {
            node: {
              id: 'o-1',
              name: 'ACME expansion',
              amount: { amountMicros: '12500000000', currencyCode: 'USD' },
              stage: 'NEW_LEAD',
              company: { name: 'ACME' },
            },
          },
        ],
      },
    });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('opportunity', 'o-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card?.details).toEqual(['$12,500', 'New lead', 'ACME']);
  });

  it('should not build a card when the answer enumerates records in a list', async () => {
    const responseText = [
      '30 opportunities are in the "New" stage.',
      '',
      `- [iPhone Corporate Program](${WORKSPACE_BASE_URL}/object/opportunity/o-1)`,
      `- [Apple Watch Corporate Wellness](${WORKSPACE_BASE_URL}/object/opportunity/o-2)`,
    ].join('\n');

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should not build a card for a numbered list of records', async () => {
    const responseText = [
      'The three largest deals:',
      `1. [ACME](${WORKSPACE_BASE_URL}/object/company/c-1)`,
      `2. [Globex](${WORKSPACE_BASE_URL}/object/company/c-2)`,
    ].join('\n');

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should build a card for the record the answer leads with, even when it links related records', async () => {
    queryMock.mockResolvedValue({
      opportunities: {
        edges: [
          {
            node: {
              id: 'o-1',
              name: 'iPhone Corporate Program',
              amount: { amountMicros: '3200000000000', currencyCode: 'USD' },
              stage: 'NEW',
              company: { name: 'Microsoft' },
            },
          },
        ],
      },
    });

    const responseText = [
      `Details for the first "New" opportunity: [iPhone Corporate Program](${WORKSPACE_BASE_URL}/object/opportunity/o-1)`,
      '',
      '- Stage: New',
      `- Company: [Microsoft](${WORKSPACE_BASE_URL}/object/company/c-1)`,
      `- Point of contact: [Kimberly Gordon](${WORKSPACE_BASE_URL}/object/person/p-1)`,
    ].join('\n');

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toEqual({
      recordName: 'iPhone Corporate Program',
      objectLabel: 'Opportunity',
      recordUrl: `${WORKSPACE_BASE_URL}/object/opportunity/o-1`,
      details: ['$3,200,000', 'New', 'Microsoft'],
    });
  });

  it('should not build a card when the answer links no record', async () => {
    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: 'No matching company.',
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should card an object with no definition from the link alone', async () => {
    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('workspaceMember', 'w-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toEqual({
      recordName: 'ACME',
      objectLabel: 'Workspace member',
      recordUrl: `${WORKSPACE_BASE_URL}/object/workspaceMember/w-1`,
      details: [],
    });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should show the record name only when the app role cannot read the object', async () => {
    queryMock.mockRejectedValue(
      new Error('Entity performing the request does not have permission'),
    );

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toEqual({
      recordName: 'ACME',
      objectLabel: 'Company',
      recordUrl: `${WORKSPACE_BASE_URL}/object/company/c-1`,
      details: [],
    });
  });

  it('should not retry a narrower selection when the role reads nothing', async () => {
    queryMock.mockRejectedValue(
      new Error('Entity performing the request does not have permission'),
    );

    await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('should show the record name only when the record cannot be read at all', async () => {
    queryMock.mockRejectedValue(new Error('upstream timeout'));

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(card?.details).toEqual([]);
  });

  it('should fall back to no card when the record no longer exists', async () => {
    queryMock.mockResolvedValue({ companies: { edges: [] } });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
  });

  it('should still match a record link carrying a view id', async () => {
    queryMock.mockResolvedValue({
      companies: { edges: [{ node: { id: 'c-1', name: 'ACME' } }] },
    });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: `Created [ACME](${WORKSPACE_BASE_URL}/object/company/c-1?viewId=v-1).`,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card?.recordUrl).toBe(`${WORKSPACE_BASE_URL}/object/company/c-1`);
  });

  it('should degrade to a name-only card when a detail field is rejected', async () => {
    queryMock
      .mockRejectedValueOnce(new Error('Field "annualRevenue" does not exist'))
      .mockResolvedValueOnce({
        companies: { edges: [{ node: { id: 'c-1', name: 'ACME' } }] },
      });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(card).toEqual({
      recordName: 'ACME',
      objectLabel: 'Company',
      recordUrl: `${WORKSPACE_BASE_URL}/object/company/c-1`,
      details: [],
    });
  });

  it('should fall back to the link label when the record has no name', async () => {
    queryMock.mockResolvedValue({
      companies: { edges: [{ node: { id: 'c-1', name: null } }] },
    });

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card?.recordName).toBe('ACME');
  });
});
