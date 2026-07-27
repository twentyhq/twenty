import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  type CallRecordingRequestStatus,
  type CallRecordingStatus,
} from 'src/logic-functions/constants/call-recording-status';

export type CallRecordingWriteFields = {
  title?: string;
  externalRecordingId?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: unknown;
  summary?: { markdown: string; blocknote: null };
  calendarEventId?: string;
};

export type CallRecordingCreateFields = CallRecordingWriteFields & {
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
};

type UpsertCallRecordingResult = {
  callRecordingId: string;
  created: boolean;
};

const findCallRecordingId = async (
  client: CoreApiClient,
  id: string,
): Promise<string | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: id } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  return queryResult.callRecordings?.edges?.[0]?.node?.id ?? undefined;
};

const updateCallRecording = async (
  client: CoreApiClient,
  id: string,
  data: CallRecordingWriteFields,
): Promise<void> => {
  await client.mutation({
    updateCallRecording: {
      __args: { id, data },
      id: true,
    },
  });
};

export const upsertCallRecording = async (
  client: CoreApiClient,
  {
    id,
    createFields,
    updateFields,
  }: {
    id: string;
    createFields: CallRecordingCreateFields;
    updateFields: CallRecordingWriteFields;
  },
): Promise<UpsertCallRecordingResult> => {
  const existingId = await findCallRecordingId(client, id);

  if (isDefined(existingId)) {
    await updateCallRecording(client, id, updateFields);

    return { callRecordingId: id, created: false };
  }

  try {
    await client.mutation({
      createCallRecording: {
        __args: {
          data: {
            id,
            ...createFields,
            applicationId: APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        },
        id: true,
      },
    });

    return { callRecordingId: id, created: true };
  } catch (error) {
    // A concurrent create on the same deterministic id may have won the race.
    const raceWinnerId = await findCallRecordingId(client, id);

    if (!isDefined(raceWinnerId)) {
      throw error;
    }

    await updateCallRecording(client, id, updateFields);

    return { callRecordingId: id, created: false };
  }
};
