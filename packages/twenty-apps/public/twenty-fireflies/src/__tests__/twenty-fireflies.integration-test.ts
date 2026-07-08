import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  CALL_RECORDING_REQUEST_STATUS,
  CALL_RECORDING_STATUS,
} from 'src/logic-functions/constants/call-recording-status';

describe('App installation', () => {
  it('should find the installed Fireflies app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const matchingApplication = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(matchingApplication).toBeDefined();
  });
});

// The published twenty-client-sdk types only export CoreApiClient/CoreSchema;
// the enum exports appear at runtime after dev:generate-client regenerates the
// client against the server, hence the cast and the runtime guard.
type GeneratedCoreSchemaRuntime = {
  enumCallRecordingStatusEnum?: Record<string, string>;
};

const getServerCallRecordingStatuses = async (): Promise<string[]> => {
  const generatedCoreSchema = (await import(
    'twenty-client-sdk/core'
  )) as unknown as GeneratedCoreSchemaRuntime;
  const statusEnum = generatedCoreSchema.enumCallRecordingStatusEnum;

  if (statusEnum === undefined) {
    throw new Error(
      'enumCallRecordingStatusEnum is missing from twenty-client-sdk/core; regenerate the client against a running server (yarn twenty dev) before the integration suite',
    );
  }

  return Object.values(statusEnum);
};

describe('CallRecording status contract', () => {
  it('should accept every status and request status value the app mirrors', async () => {
    const client = new CoreApiClient();
    const serverCallRecordingStatuses = await getServerCallRecordingStatuses();

    expect(serverCallRecordingStatuses).toEqual(
      expect.arrayContaining(Object.values(CALL_RECORDING_STATUS)),
    );

    const created = await client.mutation({
      createCallRecording: {
        __args: {
          data: {
            title: 'Fireflies integration test recording',
            status: CALL_RECORDING_STATUS.PROCESSING,
            recordingRequestStatus: CALL_RECORDING_REQUEST_STATUS.REQUESTED,
          },
        },
        id: true,
        status: true,
        recordingRequestStatus: true,
      },
    });

    const callRecordingId = created.createCallRecording?.id;

    expect(callRecordingId).toBeDefined();
    expect(created.createCallRecording?.status).toBe(
      CALL_RECORDING_STATUS.PROCESSING,
    );
    expect(created.createCallRecording?.recordingRequestStatus).toBe(
      CALL_RECORDING_REQUEST_STATUS.REQUESTED,
    );

    if (callRecordingId === undefined) {
      throw new Error('Expected call recording creation to return an id');
    }

    const updated = await client.mutation({
      updateCallRecording: {
        __args: {
          id: callRecordingId,
          data: { status: CALL_RECORDING_STATUS.COMPLETED },
        },
        status: true,
      },
    });

    expect(updated.updateCallRecording?.status).toBe(
      CALL_RECORDING_STATUS.COMPLETED,
    );

    await client.mutation({
      destroyCallRecording: {
        __args: { id: callRecordingId },
        id: true,
      },
    });
  });
});
