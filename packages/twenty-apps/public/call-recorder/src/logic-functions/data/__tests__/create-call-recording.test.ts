import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { createCallRecording } from 'src/logic-functions/data/create-call-recording.util';

const APP_UNIVERSAL_IDENTIFIER = '8da4b8b5-5edf-4880-b51f-ab6e679ec617';

class FakeCoreApiClient {
  public createData: unknown;

  async mutation(mutation: any): Promise<any> {
    const data = mutation.createCallRecording.__args.data;

    this.createData = data;

    return { createCallRecording: { id: data.id } };
  }
}

describe('createCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stamps the app universal identifier as applicationId on creation', async () => {
    const client = new FakeCoreApiClient();

    await createCallRecording(client as unknown as CoreApiClient, {
      id: 'recording-1',
      data: {
        title: 'Weekly sync',
        status: CallRecordingStatus.SCHEDULED,
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
        calendarEventId: 'calendar-event-1',
      },
    });

    expect(client.createData).toEqual(
      expect.objectContaining({
        id: 'recording-1',
        applicationId: APP_UNIVERSAL_IDENTIFIER,
      }),
    );
  });
});
