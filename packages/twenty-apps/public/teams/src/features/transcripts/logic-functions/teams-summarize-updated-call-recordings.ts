import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { TEAMS_SUMMARIZE_UPDATED_CALL_RECORDINGS_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsCallRecordingEventRecord } from 'src/features/transcripts/logic-functions/types/teams-call-recording-event-record.type';
import { enqueueTeamsTranscriptSummariesOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-summaries-or-throw';

export const teamsSummarizeUpdatedCallRecordingsHandler = (
  batch: DatabaseEventBatchPayload<
    ObjectRecordUpdateEvent<TeamsCallRecordingEventRecord>
  >,
) => enqueueTeamsTranscriptSummariesOrThrow(batch.events);

export default defineLogicFunction({
  universalIdentifier:
    TEAMS_SUMMARIZE_UPDATED_CALL_RECORDINGS_UNIVERSAL_IDENTIFIER,
  name: 'teams-summarize-updated-call-recordings',
  description:
    'Queues an AI summary for each Microsoft Teams Call Recording whose transcript changed.',
  handler: teamsSummarizeUpdatedCallRecordingsHandler,
  ...(RELEASE_FLAGS.IS_TRANSCRIPT_IMPORT_RELEASED
    ? {
        databaseEventTriggerSettings: {
          eventName: 'callRecording.updated',
          updatedFields: ['transcript'],
          batchMode: true,
        },
      }
    : {}),
});
