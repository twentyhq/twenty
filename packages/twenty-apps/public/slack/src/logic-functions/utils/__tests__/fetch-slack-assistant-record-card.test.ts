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

  it('should not build a card when the answer lists several records', async () => {
    const responseText = [
      `- [ACME](${WORKSPACE_BASE_URL}/object/company/c-1)`,
      `- [Globex](${WORKSPACE_BASE_URL}/object/company/c-2)`,
    ].join('\n');

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
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

  it('should skip objects that have no card definition', async () => {
    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('workspaceMember', 'w-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should fall back to no card when the record cannot be read', async () => {
    queryMock.mockRejectedValue(new Error('forbidden'));

    const card = await fetchSlackAssistantRecordCard({
      client,
      responseText: buildResponseText('company', 'c-1'),
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(card).toBeUndefined();
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
