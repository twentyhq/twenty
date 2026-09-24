import { type CoreApiClient } from 'twenty-client-sdk/core';

import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';

export const excludeDeletedGranolaNotesOrThrow = async ({
  coreApiClient,
  noteIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  noteIds: string[];
}): Promise<string[]> => {
  if (noteIds.length === 0) {
    return [];
  }

  const callRecordingIds = noteIds.map(computeCallRecordingIdForGranolaNote);
  const result: { callRecordings?: { edges?: { node: { id: string } }[] } } =
    await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: {
            id: { in: callRecordingIds },
            deletedAt: { is: 'NOT_NULL' },
          },
          first: callRecordingIds.length,
        },
        edges: { node: { id: true } },
      },
    });
  const deletedIds = new Set(
    result.callRecordings?.edges?.map((edge) => edge.node.id) ?? [],
  );

  return noteIds.filter((_, index) => !deletedIds.has(callRecordingIds[index]));
};
