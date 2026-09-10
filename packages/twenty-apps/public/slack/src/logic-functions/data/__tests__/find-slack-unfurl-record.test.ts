import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findSlackUnfurlRecord } from 'src/logic-functions/data/find-slack-unfurl-record';

const queryMock = vi.fn();
const client = { query: queryMock };

const RECORD_ID = '20202020-1111-4111-8111-111111111111';

const selectedNode = () =>
  queryMock.mock.calls[0][0].people.edges.node as Record<string, unknown>;

describe('findSlackUnfurlRecord', () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue({
      people: { edges: [{ node: { id: RECORD_ID } }] },
    });
  });

  it('should select only what the card renders by default', async () => {
    await findSlackUnfurlRecord({
      client,
      objectNameSingular: 'person',
      recordId: RECORD_ID,
    });

    const node = selectedNode();

    expect(node).toMatchObject({ id: true, jobTitle: true });
    expect(node).not.toHaveProperty('emails');
    expect(node).not.toHaveProperty('phones');
    expect(node).not.toHaveProperty('linkedinLink');
  });

  it('should add the detail fields only for the details panel', async () => {
    await findSlackUnfurlRecord({
      client,
      objectNameSingular: 'person',
      recordId: RECORD_ID,
      includeDetails: true,
    });

    const node = selectedNode();

    expect(node).toMatchObject({
      id: true,
      emails: { primaryEmail: true },
      phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
    });
  });

  it('should return the first matching record', async () => {
    await expect(
      findSlackUnfurlRecord({
        client,
        objectNameSingular: 'person',
        recordId: RECORD_ID,
      }),
    ).resolves.toEqual({ id: RECORD_ID });
  });
});
