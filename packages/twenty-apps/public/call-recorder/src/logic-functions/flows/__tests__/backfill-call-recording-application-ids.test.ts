import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillCallRecordingApplicationIds } from 'src/logic-functions/flows/backfill-call-recording-application-ids.util';

const APP_UNIVERSAL_IDENTIFIER = '8da4b8b5-5edf-4880-b51f-ab6e679ec617';

type CallRecordingNode = {
  id: string;
  applicationId?: string | null;
};

class FakeCoreApiClient {
  public queryArgs: unknown;
  public updatedRecords: Array<{ id: string; data: unknown }> = [];

  constructor(private readonly callRecordings: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    this.queryArgs = query.callRecordings.__args;

    return {
      callRecordings: {
        pageInfo: { hasNextPage: false, endCursor: undefined },
        edges: this.callRecordings.map((node) => ({ node })),
      },
    };
  }

  async mutation(mutation: any): Promise<any> {
    const { id, data } = mutation.updateCallRecording.__args;

    this.updatedRecords.push({ id, data });

    return { updateCallRecording: { id } };
  }
}

const buildClient = (callRecordings: CallRecordingNode[]): FakeCoreApiClient =>
  new FakeCoreApiClient(callRecordings);

describe('backfillCallRecordingApplicationIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stamps the app universal identifier only on recordings missing applicationId', async () => {
    const client = buildClient([
      { id: 'recording-1', applicationId: null },
      { id: 'recording-2', applicationId: APP_UNIVERSAL_IDENTIFIER },
      { id: 'recording-3' },
      { id: 'recording-4', applicationId: '' },
    ]);

    const result = await backfillCallRecordingApplicationIds(
      client as unknown as CoreApiClient,
    );

    expect(result).toEqual({ scanned: 4, updated: 3 });
    expect(client.updatedRecords).toEqual([
      { id: 'recording-1', data: { applicationId: APP_UNIVERSAL_IDENTIFIER } },
      { id: 'recording-3', data: { applicationId: APP_UNIVERSAL_IDENTIFIER } },
      { id: 'recording-4', data: { applicationId: APP_UNIVERSAL_IDENTIFIER } },
    ]);
  });

  it('scopes the query to this app’s own recordings via the createdBy actor', async () => {
    const client = buildClient([]);

    await backfillCallRecordingApplicationIds(
      client as unknown as CoreApiClient,
    );

    expect(client.queryArgs).toEqual(
      expect.objectContaining({
        filter: {
          createdBy: {
            source: { eq: 'APPLICATION' },
            name: { eq: 'Call Recorder' },
          },
        },
      }),
    );
  });

  it('does nothing when every recording already has an applicationId', async () => {
    const client = buildClient([
      { id: 'recording-1', applicationId: APP_UNIVERSAL_IDENTIFIER },
      { id: 'recording-2', applicationId: APP_UNIVERSAL_IDENTIFIER },
    ]);

    const result = await backfillCallRecordingApplicationIds(
      client as unknown as CoreApiClient,
    );

    expect(result).toEqual({ scanned: 2, updated: 0 });
    expect(client.updatedRecords).toEqual([]);
  });
});
