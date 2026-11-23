import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { fetchGranolaNoteWithTranscriptOrThrow } from 'src/logic-functions/utils/fetch-granola-note-with-transcript-or-throw.util';
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
  personalImport,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'getNote' | 'listTranscriptPage'
  >;
  noteId: string;
  personalImport?: {
    canWriteNote: (note: GranolaNote) => Promise<boolean>;
  };
}) => {
  const note = await fetchGranolaNoteWithTranscriptOrThrow({ client, noteId });
  const callRecordingId = computeCallRecordingIdForGranolaNote(note.id);
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
  const canWriteCallRecording = isDefined(personalImport)
    ? () => personalImport.canWriteNote(note)
    : undefined;
  const personalNoteUpdatedAt = isDefined(personalImport)
    ? note.updated_at
    : null;
  const result = await upsertCallRecordingOrThrow({
    coreApiClient,
    callRecordingId,
    canWriteCallRecording,
    fields: {
      ...(isNonEmptyString(title) ? { title } : {}),
      status: hasContent ? 'COMPLETED' : 'PROCESSING',
      recordingRequestStatus: 'REQUESTED',
      externalRecordingId: note.id,
      granolaPersonalNoteUpdatedAt: personalNoteUpdatedAt,
      startedAt,
      endedAt,
      ...(isNonEmptyArray(transcript) ? { transcript } : {}),
      ...(isNonEmptyString(summary)
        ? { summary: { markdown: summary, blocknote: null } }
        : {}),
      ...(isDefined(calendarEventId) ? { calendarEventId } : {}),
    },
  });
  return { ...result, calendarEventId };
};
