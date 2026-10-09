import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaNoteSummary } from 'src/logic-functions/types/granola-api.type';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { findCallRecordingSyncStatesOrThrow } from 'src/logic-functions/utils/find-call-recording-sync-states-or-throw.util';

export const selectGranolaNotesToSyncOrThrow = async ({
  coreApiClient,
  notes,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  notes: Pick<GranolaNoteSummary, 'id' | 'updated_at'>[];
}): Promise<string[]> => {
  const callRecordingIds = notes.map((note) =>
    computeCallRecordingIdForGranolaNote(note.id),
  );
  const syncStates = await findCallRecordingSyncStatesOrThrow({
    coreApiClient,
    callRecordingIds,
  });

  return notes
    .filter((note, index) => {
      const syncState = syncStates.get(callRecordingIds[index]);

      return (
        !isDefined(syncState) ||
        (!isDefined(syncState.deletedAt) &&
          syncState.granolaNoteUpdatedAt !== note.updated_at)
      );
    })
    .map((note) => note.id);
};
