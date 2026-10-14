import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

type ExistingCallRecording = {
  id: string;
  status: string | null;
  deletedAt: string | null;
};

export const findDeletedAndCompletedCallRecordingIdsOrThrow = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<{
  deletedCallRecordingIds: Set<string>;
  completedCallRecordingIds: Set<string>;
}> => {
  if (callRecordingIds.length === 0) {
    return {
      deletedCallRecordingIds: new Set(),
      completedCallRecordingIds: new Set(),
    };
  }

  const result: {
    callRecordings?: { edges?: { node: ExistingCallRecording }[] };
  } = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { in: callRecordingIds },
          or: [
            { deletedAt: { is: 'NULL' } },
            { deletedAt: { is: 'NOT_NULL' } },
          ],
        },
        first: callRecordingIds.length,
      },
      edges: { node: { id: true, status: true, deletedAt: true } },
    },
  });
  const callRecordings =
    result.callRecordings?.edges?.map((edge) => edge.node) ?? [];

  return {
    deletedCallRecordingIds: new Set(
      callRecordings
        .filter((callRecording) => isDefined(callRecording.deletedAt))
        .map((callRecording) => callRecording.id),
    ),
    completedCallRecordingIds: new Set(
      callRecordings
        .filter(
          (callRecording) =>
            !isDefined(callRecording.deletedAt) &&
            callRecording.status === 'COMPLETED',
        )
        .map((callRecording) => callRecording.id),
    ),
  };
};
