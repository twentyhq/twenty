import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type CallRecordingUpsertOutcome } from 'src/logic-functions/types/call-recording-upsert-outcome.type';

const doesCallRecordingMatchOrThrow = async ({
  coreApiClient,
  filter,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  filter: {
    id: { eq: string };
    deletedAt?: { is: 'NOT_NULL' };
  };
}): Promise<boolean> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: { filter, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return isDefined(queryResult.callRecordings?.edges?.[0]?.node);
};

const updateCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateCallRecording: {
      __args: { id: callRecordingId, data: fields },
      id: true,
    },
  });
};

export const upsertCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<CallRecordingUpsertOutcome> => {
  if (
    await doesCallRecordingMatchOrThrow({
      coreApiClient,
      filter: { id: { eq: callRecordingId }, deletedAt: { is: 'NOT_NULL' } },
    })
  ) {
    return 'SKIPPED_DELETED';
  }

  if (
    await doesCallRecordingMatchOrThrow({
      coreApiClient,
      filter: { id: { eq: callRecordingId } },
    })
  ) {
    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return 'UPDATED';
  }

  try {
    await coreApiClient.mutation({
      createCallRecording: {
        __args: { data: { id: callRecordingId, ...fields } },
        id: true,
      },
    });

    return 'CREATED';
  } catch (error) {
    const wasCreatedConcurrently = await doesCallRecordingMatchOrThrow({
      coreApiClient,
      filter: { id: { eq: callRecordingId } },
    });

    if (!wasCreatedConcurrently) {
      throw error;
    }

    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return 'UPDATED';
  }
};
