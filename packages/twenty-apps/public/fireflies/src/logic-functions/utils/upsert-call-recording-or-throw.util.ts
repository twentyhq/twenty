import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';

type UpsertCallRecordingOrThrowResult = {
  callRecordingId: string;
  created: boolean;
};

// twenty-client-sdk 2.31 mistypes the JSON scalar as an object, rejecting the
// transcript array. Drop this cast once the app is on a fixed SDK.
const toCallRecordingInputFields = ({
  transcript,
  ...scalarFields
}: CallRecordingSyncFields) => ({
  ...scalarFields,
  ...(isDefined(transcript)
    ? { transcript: transcript as unknown as Record<string, unknown> }
    : {}),
});

const doesCallRecordingExist = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: CoreApiClient;
  callRecordingId: string;
}): Promise<boolean> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  return isDefined(node);
};

const updateCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: CoreApiClient;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateCallRecording: {
      __args: { id: callRecordingId, data: toCallRecordingInputFields(fields) },
      id: true,
    },
  });
};

export const upsertCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  createFields,
  updateFields,
}: {
  coreApiClient: CoreApiClient;
  callRecordingId: string;
  createFields: CallRecordingSyncFields;
  updateFields: CallRecordingSyncFields;
}): Promise<UpsertCallRecordingOrThrowResult> => {
  const doesRecordingExist = await doesCallRecordingExist({
    coreApiClient,
    callRecordingId,
  });

  if (doesRecordingExist) {
    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields: updateFields,
    });

    return { callRecordingId, created: false };
  }

  try {
    await coreApiClient.mutation({
      createCallRecording: {
        __args: {
          data: {
            id: callRecordingId,
            ...toCallRecordingInputFields(createFields),
          },
        },
        id: true,
      },
    });

    return { callRecordingId, created: true };
  } catch (error) {
    // A concurrent create on the same deterministic id may have won the race.
    const didConcurrentCreateWin = await doesCallRecordingExist({
      coreApiClient,
      callRecordingId,
    });

    if (!didConcurrentCreateWin) {
      throw error;
    }

    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields: updateFields,
    });

    return { callRecordingId, created: false };
  }
};
