import { CoreApiClient } from 'twenty-client-sdk/core';
import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { isGranolaPersonalNoteSelected } from 'src/logic-functions/utils/is-granola-personal-note-selected.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';

export const syncGranolaPersonalNoteOrThrow = async ({
  scope,
  apiKeyFingerprint,
  noteId,
}: {
  scope: GranolaPersonalSyncScope;
  apiKeyFingerprint: string;
  noteId: string;
}) => {
  const loadCurrentSync = () =>
    loadGranolaPersonalSync({ ...scope, apiKeyFingerprint });
  const sync = await loadCurrentSync();

  if (!isDefined(sync)) {
    return { skipped: true };
  }

  const client = createGranolaClientOrThrow({ apiKey: sync.apiKey });

  try {
    return await syncGranolaNoteToCallRecordingOrThrow({
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      client,
      noteId,
      personalImport: {
        canWriteNote: async (note) => {
          const shouldFetchAncestry =
            !isGranolaPersonalNoteSelected({
              note,
              selection: sync.selection,
              folders: [],
            }) &&
            note.folder_membership.some(({ parent_folder_id }) =>
              isDefined(parent_folder_id),
            );
          const folders = shouldFetchAncestry
            ? await listAllGranolaFoldersOrThrow({ client })
            : [];
          const current = await loadCurrentSync();

          return (
            isDefined(current) &&
            isGranolaPersonalNoteSelected({
              note,
              selection: current.selection,
              folders,
            })
          );
        },
      },
    });
  } catch (error) {
    if (error instanceof GranolaApiError && error.status === 401) {
      const current = await loadCurrentSync();

      if (!isDefined(current)) {
        return { skipped: true };
      }

      await reportConnectionAuthFailure({ connectionId: scope.connectionId });

      return { skipped: true };
    }

    if (
      error instanceof GranolaInvalidResponseError ||
      error instanceof GranolaTranscriptLimitError ||
      (error instanceof GranolaApiError && [403, 404].includes(error.status))
    ) {
      console.error(
        `[granola] Skipped unreadable personal note ${noteId}: ${error.message}`,
      );

      return { skipped: true };
    }

    throw error;
  }
};
