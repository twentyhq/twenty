import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';

import { TEAMS_SYNC_TRANSCRIPT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getCallTranscript } from 'src/logic-functions/utils/get-call-transcript.util';
import { getGraphAccessToken } from 'src/logic-functions/utils/get-graph-access-token.util';
import {
  type SyncTranscriptResult,
  syncTranscriptToCallRecording,
} from 'src/logic-functions/utils/sync-transcript-to-call-recording.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const teamsSyncTranscriptInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    organizerUserId: {
      type: 'string',
      label: 'Organizer user ID',
      description:
        'Microsoft Entra object ID of the user who organized the meeting.',
    },
    meetingId: {
      type: 'string',
      label: 'Online meeting ID',
      description: 'Microsoft Graph onlineMeeting id the transcript belongs to.',
    },
    transcriptId: {
      type: 'string',
      label: 'Transcript ID',
      description:
        'Microsoft Graph callTranscript id, as returned by List Teams Transcripts By Organizer.',
    },
  },
  required: ['organizerUserId', 'meetingId', 'transcriptId'],
  additionalProperties: false,
};

type TeamsSyncTranscriptResult =
  | ({ success: true } & SyncTranscriptResult)
  | { success: false; error: string };

export const teamsSyncTranscriptHandler = async (parameters: {
  organizerUserId?: unknown;
  meetingId?: unknown;
  transcriptId?: unknown;
}): Promise<TeamsSyncTranscriptResult> => {
  const { organizerUserId, meetingId, transcriptId } = parameters;

  if (
    !isNonEmptyString(organizerUserId) ||
    !isNonEmptyString(meetingId) ||
    !isNonEmptyString(transcriptId)
  ) {
    return {
      success: false,
      error: 'organizerUserId, meetingId and transcriptId are required',
    };
  }

  try {
    const accessToken = await getGraphAccessToken();
    const transcript = await getCallTranscript({
      accessToken,
      organizerUserId,
      meetingId,
      transcriptId,
    });
    const syncResult = await syncTranscriptToCallRecording({
      accessToken,
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      organizerUserId,
      transcript,
    });

    return { success: true, ...syncResult };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_SYNC_TRANSCRIPT_UNIVERSAL_IDENTIFIER,
  name: 'teams-sync-transcript',
  description:
    'Import one Microsoft Teams meeting transcript into a CallRecording: downloads the transcript from Microsoft Graph, parses the speaker-attributed text, links the matching CalendarEvent, and upserts the record.',
  timeoutSeconds: 120,
  handler: teamsSyncTranscriptHandler,
  toolTriggerSettings: { inputSchema: teamsSyncTranscriptInputSchema },
  workflowActionTriggerSettings: {
    label: 'Sync Teams Transcript',
    inputSchema: jsonSchemaToInputSchema(teamsSyncTranscriptInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          callRecordingId: { type: 'string' },
          calendarEventId: { type: 'string' },
          created: { type: 'boolean' },
          entryCount: { type: 'number' },
          isSpeakerAttributed: { type: 'boolean' },
        },
      },
    ],
  },
});
