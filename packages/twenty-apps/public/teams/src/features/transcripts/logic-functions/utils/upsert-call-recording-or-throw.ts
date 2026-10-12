import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingSyncFields } from 'src/features/transcripts/logic-functions/types/call-recording-sync-fields.type';

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

const toCallRecordingData = ({
  transcript,
  ...fields
}: CallRecordingSyncFields) =>
  isDefined(transcript)
    ? {
        ...fields,
        transcript: transcript as unknown as Record<string, unknown>,
      }
    : fields;

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
      __args: { id: callRecordingId, data: toCallRecordingData(fields) },
      id: true,
    },
  });
};

const createCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  fields: CallRecordingSyncFields;
}): Promise<void> => {
  await coreApiClient.mutation({
    createCallRecording: {
      __args: { data: { id: callRecordingId, ...toCallRecordingData(fields) } },
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
}): Promise<{ created: boolean; skipped: boolean }> => {
  if (
    await doesCallRecordingMatchOrThrow({
      coreApiClient,
      filter: { id: { eq: callRecordingId }, deletedAt: { is: 'NOT_NULL' } },
    })
  ) {
    return { created: false, skipped: true };
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

    return { created: false, skipped: false };
  }

  try {
    await createCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return { created: true, skipped: false };
  } catch (error) {
    if (
      !(await doesCallRecordingMatchOrThrow({
        coreApiClient,
        filter: { id: { eq: callRecordingId } },
      }))
    ) {
      throw error;
    }

    await updateCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      fields,
    });

    return { created: false, skipped: false };
  }
};
