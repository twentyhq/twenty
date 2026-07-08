import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording';

const APP_UNIVERSAL_IDENTIFIER = '97d24431-ebc7-4156-9705-b6900e73edc8';

class FakeCoreApiClient {
  public createData: any;
  public updateData: any;

  constructor(private readonly existingId: string | undefined) {}

  async query(): Promise<any> {
    return {
      callRecordings: {
        edges:
          this.existingId === undefined
            ? []
            : [{ node: { id: this.existingId } }],
      },
    };
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.createCallRecording !== undefined) {
      this.createData = mutation.createCallRecording.__args.data;

      return { createCallRecording: { id: this.createData.id } };
    }

    this.updateData = mutation.updateCallRecording.__args.data;

    return { updateCallRecording: { id: mutation.updateCallRecording.__args.id } };
  }
}

describe('upsertCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stamps the app universal identifier as applicationId when creating', async () => {
    const client = new FakeCoreApiClient(undefined);

    const result = await upsertCallRecording(
      client as unknown as CoreApiClient,
      {
        id: 'recording-1',
        createFields: { title: 'Sales call', status: 'PROCESSING' },
        updateFields: { title: 'Sales call' },
      },
    );

    expect(result).toEqual({ callRecordingId: 'recording-1', created: true });
    expect(client.createData).toEqual(
      expect.objectContaining({
        id: 'recording-1',
        applicationId: APP_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('does not touch applicationId when updating an existing recording', async () => {
    const client = new FakeCoreApiClient('recording-1');

    const result = await upsertCallRecording(
      client as unknown as CoreApiClient,
      {
        id: 'recording-1',
        createFields: { title: 'Sales call' },
        updateFields: { title: 'Sales call', summary: { markdown: 'x', blocknote: null } },
      },
    );

    expect(result).toEqual({ callRecordingId: 'recording-1', created: false });
    expect(client.createData).toBeUndefined();
    expect(client.updateData).not.toHaveProperty('applicationId');
  });
});
