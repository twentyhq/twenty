import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

export type CallRecordingWriteFields = {
  title?: string;
  status?: string;
  recordingRequestStatus?: string;
  externalRecordingId?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: unknown;
  summary?: { markdown: string; blocknote: null };
  calendarEventId?: string;
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
    createFields: CallRecordingWriteFields;
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
        __args: { data: { id, ...createFields } },
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
