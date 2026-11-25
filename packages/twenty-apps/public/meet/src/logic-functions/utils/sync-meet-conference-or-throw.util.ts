import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { type MeetConferenceSyncResult } from 'src/logic-functions/types/meet-conference-sync-result.type';
import { buildMeetCallRecordingSyncFields } from 'src/logic-functions/utils/build-meet-call-recording-sync-fields.util';
import { computeCallRecordingIdForMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-meet-conference.util';
import { findMeetCalendarEvent } from 'src/logic-functions/utils/find-meet-calendar-event.util';
import { findMeetConferenceTitle } from 'src/logic-functions/utils/find-meet-conference-title.util';
import { findMeetSmartNotesMarkdown } from 'src/logic-functions/utils/find-meet-smart-notes-markdown.util';
import { getMeetSpace } from 'src/logic-functions/utils/get-meet-space.util';
import { listMeetParticipants } from 'src/logic-functions/utils/list-meet-participants.util';
import { listMeetRecordings } from 'src/logic-functions/utils/list-meet-recordings.util';
import { listMeetSmartNotes } from 'src/logic-functions/utils/list-meet-smart-notes.util';
import { listMeetTranscriptEntries } from 'src/logic-functions/utils/list-meet-transcript-entries.util';
import { listMeetTranscripts } from 'src/logic-functions/utils/list-meet-transcripts.util';
import { mapMeetTranscriptEntries } from 'src/logic-functions/utils/map-meet-transcript-entries.util';
import { shouldGenerateMeetAiSummary } from 'src/logic-functions/utils/should-generate-meet-ai-summary.util';
import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

export const syncMeetConferenceOrThrow = async ({
  accessToken,
  coreApiClient,
  conferenceRecord,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  conferenceRecord: Pick<
    MeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
}): Promise<MeetConferenceSyncResult> => {
  const [transcripts, smartNotes, recordings] = await Promise.all([
    listMeetTranscripts({
      accessToken,
      conferenceRecordName: conferenceRecord.name,
    }),
    listMeetSmartNotes({
      accessToken,
      conferenceRecordName: conferenceRecord.name,
    }),
    listMeetRecordings({
      accessToken,
      conferenceRecordName: conferenceRecord.name,
    }),
  ]);

  if (
    !isNonEmptyArray(transcripts) &&
    !isNonEmptyArray(smartNotes) &&
    !isNonEmptyArray(recordings)
  ) {
    return { outcome: 'NO_ARTIFACT', shouldGenerateAiSummary: false };
  }

  const [participants, transcriptEntriesByTranscript, space, summaryMarkdown] =
    await Promise.all([
      listMeetParticipants({
        accessToken,
        conferenceRecordName: conferenceRecord.name,
      }),
      Promise.all(
        transcripts.map(({ name }) =>
          listMeetTranscriptEntries({
            accessToken,
            transcriptName: name,
          }),
        ),
      ),
      isNonEmptyString(conferenceRecord.space)
        ? getMeetSpace({ accessToken, spaceName: conferenceRecord.space })
        : undefined,
      findMeetSmartNotesMarkdown({ accessToken, smartNotes }),
    ]);

  const calendarEvent = isDefined(space)
    ? await findMeetCalendarEvent({
        coreApiClient,
        conferenceRecord,
        space,
      })
    : undefined;

  const transcriptEntries = mapMeetTranscriptEntries({
    conferenceRecord,
    participants,
    transcriptEntries: transcriptEntriesByTranscript.flat(),
  });
  // Google lists recordings by start time; a call keeps its first video.
  const recordingToImport = recordings.find(
    ({ state }) => state === 'FILE_GENERATED',
  );

  const outcome = await upsertCallRecordingOrThrow({
    coreApiClient,
    callRecordingId: computeCallRecordingIdForMeetConference(
      conferenceRecord.name,
    ),
    fields: buildMeetCallRecordingSyncFields({
      conferenceRecord,
      title: await findMeetConferenceTitle({
        accessToken,
        calendarEvent,
        artifacts: [...transcripts, ...smartNotes],
      }),
      summaryMarkdown,
      transcriptEntries,
      hasRecordingFile: isDefined(recordingToImport),
      calendarEvent,
    }),
  });

  if (outcome === 'SKIPPED_DELETED') {
    return { outcome, shouldGenerateAiSummary: false };
  }

  return {
    outcome,
    shouldGenerateAiSummary: shouldGenerateMeetAiSummary({
      transcriptEntries,
      summaryMarkdown,
      smartNotes,
    }),
    ...(isDefined(recordingToImport)
      ? { recordingNameToImport: recordingToImport.name }
      : {}),
  };
};
