import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { fetchGranolaNoteWithTranscriptOrThrow } from 'src/logic-functions/utils/fetch-granola-note-with-transcript-or-throw.util';
import { findCallRecordingSyncStatesOrThrow } from 'src/logic-functions/utils/find-call-recording-sync-states-or-throw.util';
import { findMatchingCalendarEventOrThrow } from 'src/logic-functions/utils/find-matching-calendar-event-or-throw.util';
import { formatGranolaSummary } from 'src/logic-functions/utils/format-granola-summary.util';
import { getGranolaNoteTimeRange } from 'src/logic-functions/utils/get-granola-note-time-range.util';
import { getGranolaNoteTitle } from 'src/logic-functions/utils/get-granola-note-title.util';
import { mapGranolaTranscriptToEntries } from 'src/logic-functions/utils/map-granola-transcript-to-entries.util';
import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

export const syncGranolaNoteToCallRecordingOrThrow = async ({
  coreApiClient,
  client,
  noteId,
  shouldSkipUnchangedNote,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'getNote' | 'listTranscriptPage'
  >;
  noteId: string;
  shouldSkipUnchangedNote: boolean;
}) => {
  const note = await fetchGranolaNoteWithTranscriptOrThrow({ client, noteId });
  const callRecordingId = computeCallRecordingIdForGranolaNote(note.id);
  const syncState = (
    await findCallRecordingSyncStatesOrThrow({
      coreApiClient,
      callRecordingIds: [callRecordingId],
    })
  ).get(callRecordingId);

  if (isDefined(syncState?.deletedAt)) {
    return { callRecordingId, created: false, skipped: true };
  }

  if (
    shouldSkipUnchangedNote &&
    syncState?.granolaNoteUpdatedAt === note.updated_at
  ) {
    return { callRecordingId, created: false, skipped: true, unchanged: true };
  }

  const { startedAt, endedAt } = getGranolaNoteTimeRange(note);
  const transcript = mapGranolaTranscriptToEntries({
    transcript: note.transcript,
    owner: note.owner,
    startedAt,
  });
  const summary = formatGranolaSummary(note);
  const title = getGranolaNoteTitle(note);
  const calendarEventId = await findMatchingCalendarEventOrThrow({
    coreApiClient,
    note,
  });
  const hasContent = isNonEmptyArray(transcript) || isNonEmptyString(summary);
  const isNoteFullyImported =
    isNonEmptyArray(transcript) &&
    isNonEmptyString(summary) &&
    (isDefined(calendarEventId) || !isDefined(note.calendar_event));
  const result = await upsertCallRecordingOrThrow({
    coreApiClient,
    callRecordingId,
    syncState,
    fields: {
      ...(isNonEmptyString(title) ? { title } : {}),
      status: hasContent ? 'COMPLETED' : 'PROCESSING',
      recordingRequestStatus: 'REQUESTED',
      externalRecordingId: note.id,
      startedAt,
      endedAt,
      ...(isNonEmptyArray(transcript) ? { transcript } : {}),
      ...(isNonEmptyString(summary)
        ? { summary: { markdown: summary, blocknote: null } }
        : {}),
      ...(isDefined(calendarEventId) ? { calendarEventId } : {}),
      granolaNoteUpdatedAt: isNoteFullyImported ? note.updated_at : null,
    },
  });
  return { ...result, calendarEventId };
};
