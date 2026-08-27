import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';

// The generated client narrows JSON input to an object even though the field
// accepts the transcript array serialized by Twenty.
const toCallRecordingInputFields = ({
  transcript,
  ...scalarFields
}: CallRecordingSyncFields) => ({
  ...scalarFields,
  ...(transcript === undefined
    ? {}
    : { transcript: transcript as unknown as Record<string, unknown> }),
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
      edges: { node: { id: true } },
    },
  });

  return queryResult.callRecordings?.edges?.[0]?.node !== undefined;
};

const updateCallRecording = async ({
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
      __args: {
        id: callRecordingId,
        data: toCallRecordingInputFields(fields),
      },
      id: true,
    },
  });
};

export const upsertCallRecording = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: CoreApiClient;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<{ callRecordingId: string; created: boolean }> => {
  if (await doesCallRecordingExist({ coreApiClient, callRecordingId })) {
    await updateCallRecording({ coreApiClient, callRecordingId, fields });

    return { callRecordingId, created: false };
  }

  try {
    await coreApiClient.mutation({
      createCallRecording: {
        __args: {
          data: {
            id: callRecordingId,
            ...toCallRecordingInputFields(fields),
          },
        },
        id: true,
      },
    });

    return { callRecordingId, created: true };
  } catch (error) {
    if (!(await doesCallRecordingExist({ coreApiClient, callRecordingId }))) {
      throw error;
    }

    await updateCallRecording({ coreApiClient, callRecordingId, fields });

    return { callRecordingId, created: false };
  }
};
