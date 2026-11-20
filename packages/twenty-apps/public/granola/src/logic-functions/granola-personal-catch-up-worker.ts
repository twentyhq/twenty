import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_MAX_PAGE_SIZE } from 'src/constants/granola-api.constant';
import { GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaPersonalCatchUpPayload } from 'src/logic-functions/types/granola-personal-catch-up-payload.type';
import { buildGranolaPersonalCatchUpJob } from 'src/logic-functions/utils/build-granola-personal-catch-up-job.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { enqueueGranolaJobsOrThrow } from 'src/logic-functions/utils/enqueue-granola-jobs-or-throw.util';
import { excludeDeletedGranolaNotesOrThrow } from 'src/logic-functions/utils/exclude-deleted-granola-notes-or-throw.util';
import { getGranolaNextPage } from 'src/logic-functions/utils/get-granola-next-page.util';
import { getGranolaNoteImportSchedule } from 'src/logic-functions/utils/get-granola-note-import-schedule.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';
import { syncGranolaPersonalNoteOrThrow } from 'src/logic-functions/utils/sync-granola-personal-note-or-throw.util';

const enqueueCatchUpOrThrow = async ({
  payload,
  delayMs,
}: {
  payload: GranolaPersonalCatchUpPayload;
  delayMs: number;
}) =>
  enqueueGranolaJobsOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
    jobs: [buildGranolaPersonalCatchUpJob(payload)],
    delayMs,
  });

export const granolaPersonalCatchUpWorkerHandler = async (
  payload: GranolaPersonalCatchUpPayload,
) => {
  const { scope, apiKeyFingerprint, updatedAfter } = payload;
  const loadCurrentSync = () =>
    loadGranolaPersonalSync({ ...scope, apiKeyFingerprint });

  try {
    if (payload.kind === 'note') {
      const result = await syncGranolaPersonalNoteOrThrow({
        scope,
        apiKeyFingerprint,
        noteId: payload.noteId,
      });

      return { success: true, ...result };
    }

    const sync = await loadCurrentSync();

    if (!isDefined(sync)) {
      return { success: true, skipped: true };
    }

    const sortedSelection = [...sync.selection].sort((first, second) =>
      first.folderId.localeCompare(second.folderId),
    );
    const selectedFolder = sortedSelection.find(
      ({ folderId }) =>
        !isDefined(payload.folderId) ||
        folderId.localeCompare(payload.folderId) >= 0,
    );

    if (!isDefined(selectedFolder)) {
      return { success: true, skipped: true };
    }

    const { folderId, selectedAt } = selectedFolder;
    const cursor = folderId === payload.folderId ? payload.cursor : undefined;
    const pageIndex = folderId === payload.folderId ? payload.pageIndex : 0;
    const client = createGranolaClientOrThrow({ apiKey: sync.apiKey });
    const page = await client
      .listNotes({
        updated_after: updatedAfter,
        folder_id: folderId,
        cursor,
        page_size: GRANOLA_MAX_PAGE_SIZE,
      })
      .catch((error: unknown) => {
        if (
          !(error instanceof GranolaApiError) ||
          ![403, 404].includes(error.status)
        ) {
          throw error;
        }

        console.warn(
          `[granola] Skipping folder ${folderId} for personal connection ${scope.connectionId} after Granola returned HTTP ${error.status}.`,
        );

        return { notes: [], hasMore: false, cursor: null };
      });
    const selectedAtTimestamp = Date.parse(selectedAt);
    const noteIds = await excludeDeletedGranolaNotesOrThrow({
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      noteIds: page.notes
        .filter(
          ({ created_at }) => Date.parse(created_at) >= selectedAtTimestamp,
        )
        .map(({ id }) => id),
    });
    const schedule = getGranolaNoteImportSchedule({
      now: Date.now(),
      noteCount: noteIds.length,
    });

    for (const [index, noteId] of noteIds.entries()) {
      await enqueueCatchUpOrThrow({
        payload: {
          kind: 'note',
          scope,
          apiKeyFingerprint,
          updatedAfter,
          noteId,
        },
        delayMs: schedule.noteDelays[index],
      });
    }

    const nextPage = getGranolaNextPage({
      ...page,
      previousCursor: cursor,
      pageIndex,
    });

    if (nextPage.kind === 'stalled') {
      console.error(`[granola] ${nextPage.reason} Folder ${folderId}.`);
    }

    const nextFolderId =
      nextPage.kind === 'next'
        ? folderId
        : sortedSelection.find(
            (selection) => selection.folderId.localeCompare(folderId) > 0,
          )?.folderId;

    if (isDefined(nextFolderId)) {
      await enqueueCatchUpOrThrow({
        payload: {
          ...payload,
          folderId: nextFolderId,
          cursor: nextPage.kind === 'next' ? nextPage.cursor : undefined,
          pageIndex: nextPage.kind === 'next' ? pageIndex + 1 : 0,
        },
        delayMs: schedule.continuationDelay,
      });
    }

    return { success: true, hasMore: isDefined(nextFolderId) };
  } catch (error) {
    if (
      payload.kind !== 'scan' ||
      !(error instanceof GranolaApiError) ||
      error.status !== 401
    ) {
      return rethrowKnownOrWrapGranolaError({
        operation: 'Personal catch-up',
        error,
      });
    }

    if (!isDefined(await loadCurrentSync())) {
      return { success: true, skipped: true };
    }

    await reportConnectionAuthFailure({ connectionId: scope.connectionId });

    return { success: true, skipped: true };
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-catch-up-worker',
  description:
    'Discovers and imports missed notes for opted-in personal folders.',
  timeoutSeconds: 900,
  handler: granolaPersonalCatchUpWorkerHandler,
});
