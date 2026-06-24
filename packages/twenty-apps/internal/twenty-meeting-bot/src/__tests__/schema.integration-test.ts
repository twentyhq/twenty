import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import {
  executeCurrentSchemaMutation,
  type CurrentSchemaUpdateCallRecordingMutation,
} from 'src/logic-functions/data/execute-current-schema-mutation.util';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const app = result.findManyApplications.find(
      (a: { universalIdentifier: string }) =>
        a.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(app).toBeDefined();
  });
});

describe('CallRecording status contract', () => {
  it('accepts every status and request status value the app mirrors', async () => {
    const client = new CoreApiClient();

    const created = await client.mutation({
      createCallRecording: {
        __args: {
          data: {
            title: 'Integration test recording',
            status: CallRecordingStatus.SCHEDULED,
            recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
          },
        },
        id: true,
      },
    });

    const callRecordingId = created.createCallRecording?.id;

    expect(callRecordingId).toBeDefined();

    if (callRecordingId === undefined) {
      throw new Error('Expected call recording creation to return an id');
    }

    for (const status of Object.values(CallRecordingStatus)) {
      const mutation = {
        updateCallRecording: {
          __args: { id: callRecordingId, data: { status } },
          status: true,
        },
      } satisfies CurrentSchemaUpdateCallRecordingMutation;

      const updated = await executeCurrentSchemaMutation(client, mutation);

      expect(updated.updateCallRecording?.status).toBe(status);
    }

    for (const recordingRequestStatus of Object.values(
      CallRecordingRequestStatus,
    )) {
      const updated = await client.mutation({
        updateCallRecording: {
          __args: { id: callRecordingId, data: { recordingRequestStatus } },
          recordingRequestStatus: true,
        },
      });

      expect(updated.updateCallRecording?.recordingRequestStatus).toBe(
        recordingRequestStatus,
      );
    }

    await client.mutation({
      destroyCallRecording: {
        __args: { id: callRecordingId },
        id: true,
      },
    });
  });
});
