import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventBatchPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';

import { TEAMS_SUMMARIZE_CREATED_CALL_RECORDINGS_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsCallRecordingEventRecord } from 'src/features/transcripts/logic-functions/types/teams-call-recording-event-record.type';
import { enqueueTeamsTranscriptSummariesOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-summaries-or-throw';

export const teamsSummarizeCreatedCallRecordingsHandler = (
  batch: DatabaseEventBatchPayload<
    ObjectRecordCreateEvent<TeamsCallRecordingEventRecord>
  >,
) => enqueueTeamsTranscriptSummariesOrThrow(batch.events);

export default defineLogicFunction({
  universalIdentifier:
    TEAMS_SUMMARIZE_CREATED_CALL_RECORDINGS_UNIVERSAL_IDENTIFIER,
  name: 'teams-summarize-created-call-recordings',
  description:
    'Queues an AI summary for each Call Recording that Microsoft Teams created with a transcript.',
  handler: teamsSummarizeCreatedCallRecordingsHandler,
  databaseEventTriggerSettings: {
    eventName: 'callRecording.created',
    batchMode: true,
  },
});
