import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { GRANOLA_MAX_PAGE_SIZE } from 'src/constants/granola-api.constant';
import {
  GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
  GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type GranolaBackfillNotePayload } from 'src/logic-functions/types/granola-backfill-note-payload.type';
import { type GranolaBackfillWorkerPayload } from 'src/logic-functions/types/granola-backfill-worker-payload.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { excludeDeletedGranolaNotesOrThrow } from 'src/logic-functions/utils/exclude-deleted-granola-notes-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';
import { getGranolaNextPage } from 'src/logic-functions/utils/get-granola-next-page.util';
import { isGranolaJobInRegistrationScope } from 'src/logic-functions/utils/is-granola-job-in-registration-scope.util';
import { reserveGranolaNoteImportSlotsOrThrow } from 'src/logic-functions/utils/reserve-granola-note-import-slots-or-throw.util';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';

export const granolaBackfillWorkerHandler = async (
  payload: GranolaBackfillWorkerPayload,
) => {
  try {
    const registration = await findGranolaRegistrationForCurrentKey();

    if (
      !isGranolaJobInRegistrationScope({
        registration,
        registrationId: payload.registrationId,
        folderId: payload.folderId,
      })
    ) {
      return { success: true, skipped: true };
    }

    const page = await createGranolaClientOrThrow().listNotes({
      created_after: payload.createdAfter,
      updated_after: payload.updatedAfter,
      folder_id: payload.folderId,
      cursor: payload.cursor,
      page_size: GRANOLA_MAX_PAGE_SIZE,
    });
    const noteIds = await excludeDeletedGranolaNotesOrThrow({
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      noteIds: page.notes.map((note) => note.id),
    });
    const schedule = await reserveGranolaNoteImportSlotsOrThrow(noteIds.length);

    for (const [index, noteId] of noteIds.entries()) {
      const notePayload: GranolaBackfillNotePayload = {
        registrationId: payload.registrationId,
        folderId: payload.folderId,
        noteId,
      };

      await enqueueGranolaJobOrThrow({
        logicFunctionUniversalIdentifier:
          GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
        payload: notePayload,
        jobId: getGranolaJobId({
          prefix: 'granola-note',
          identity: {
            ...notePayload,
            createdAfter: payload.createdAfter,
            updatedAfter: payload.updatedAfter,
          },
        }),
        delayMs: schedule.noteDelays[index],
      });
    }

    const nextPage = getGranolaNextPage({
      ...page,
      previousCursor: payload.cursor,
      pageIndex: payload.pageIndex,
    });

    if (nextPage.kind === 'stalled') {
      console.error(
        `[granola] ${nextPage.reason} Registration ${payload.registrationId}, cursor ${page.cursor}.`,
      );

      return {
        success: true,
        discoveredNoteCount: page.notes.length,
        enqueuedNoteCount: noteIds.length,
        hasMore: true,
        stopped: true,
      };
    }

    if (nextPage.kind === 'next') {
      const continuationPayload: GranolaBackfillWorkerPayload = {
        ...payload,
        cursor: nextPage.cursor,
        pageIndex: payload.pageIndex + 1,
      };

      await enqueueGranolaJobOrThrow({
        logicFunctionUniversalIdentifier:
          GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
        payload: continuationPayload,
        jobId: getGranolaJobId({
          prefix: 'granola-discovery',
          identity: continuationPayload,
        }),
        delayMs: schedule.continuationDelay,
      });
    }

    return {
      success: true,
      discoveredNoteCount: page.notes.length,
      enqueuedNoteCount: noteIds.length,
      hasMore: nextPage.kind === 'next',
    };
  } catch (error) {
    rethrowKnownOrWrapGranolaError({
      operation: 'History discovery',
      error,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'granola-backfill-worker',
  description:
    'Discovers one page of Granola notes and schedules paced note imports.',
  timeoutSeconds: 120,
  handler: granolaBackfillWorkerHandler,
});
