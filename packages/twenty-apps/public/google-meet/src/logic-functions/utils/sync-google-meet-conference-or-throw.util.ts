import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type GoogleMeetConferenceSyncResult } from 'src/logic-functions/types/google-meet-conference-sync-result.type';
import { buildGoogleMeetCallRecordingSyncFields } from 'src/logic-functions/utils/build-google-meet-call-recording-sync-fields.util';
import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';
import { findGoogleMeetCalendarEvent } from 'src/logic-functions/utils/find-google-meet-calendar-event.util';
import { findGoogleMeetConferenceTitle } from 'src/logic-functions/utils/find-google-meet-conference-title.util';
import { findGoogleMeetSmartNotesMarkdown } from 'src/logic-functions/utils/find-google-meet-smart-notes-markdown.util';
import { getGoogleMeetSpace } from 'src/logic-functions/utils/get-google-meet-space.util';
import { listGoogleMeetParticipants } from 'src/logic-functions/utils/list-google-meet-participants.util';
import { listGoogleMeetRecordings } from 'src/logic-functions/utils/list-google-meet-recordings.util';
import { listGoogleMeetSmartNotes } from 'src/logic-functions/utils/list-google-meet-smart-notes.util';
import { listGoogleMeetTranscriptEntries } from 'src/logic-functions/utils/list-google-meet-transcript-entries.util';
import { listGoogleMeetTranscripts } from 'src/logic-functions/utils/list-google-meet-transcripts.util';
import { mapGoogleMeetTranscriptEntries } from 'src/logic-functions/utils/map-google-meet-transcript-entries.util';
import { shouldGenerateGoogleMeetAiSummary } from 'src/logic-functions/utils/should-generate-google-meet-ai-summary.util';
import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

export const syncGoogleMeetConferenceOrThrow = async ({
  accessToken,
  coreApiClient,
  conferenceRecord,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
}): Promise<GoogleMeetConferenceSyncResult> => {
  const [transcripts, smartNotes, recordings] = await Promise.all([
    listGoogleMeetTranscripts({
      accessToken,
      conferenceRecordName: conferenceRecord.name,
    }),
    listGoogleMeetSmartNotes({
      accessToken,
      conferenceRecordName: conferenceRecord.name,
    }),
    listGoogleMeetRecordings({
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
      listGoogleMeetParticipants({
        accessToken,
        conferenceRecordName: conferenceRecord.name,
      }),
      Promise.all(
        transcripts.map(({ name }) =>
          listGoogleMeetTranscriptEntries({
            accessToken,
            transcriptName: name,
          }),
        ),
      ),
      isNonEmptyString(conferenceRecord.space)
        ? getGoogleMeetSpace({ accessToken, spaceName: conferenceRecord.space })
        : undefined,
      findGoogleMeetSmartNotesMarkdown({ accessToken, smartNotes }),
    ]);

  const calendarEvent = isDefined(space)
    ? await findGoogleMeetCalendarEvent({
        coreApiClient,
        conferenceRecord,
        space,
      })
    : undefined;

  const transcriptEntries = mapGoogleMeetTranscriptEntries({
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
    callRecordingId: computeCallRecordingIdForGoogleMeetConference(
      conferenceRecord.name,
    ),
    fields: buildGoogleMeetCallRecordingSyncFields({
      conferenceRecord,
      title: await findGoogleMeetConferenceTitle({
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
    shouldGenerateAiSummary: shouldGenerateGoogleMeetAiSummary({
      transcriptEntries,
      summaryMarkdown,
      smartNotes,
    }),
    ...(isDefined(recordingToImport)
      ? { recordingNameToImport: recordingToImport.name }
      : {}),
  };
};
