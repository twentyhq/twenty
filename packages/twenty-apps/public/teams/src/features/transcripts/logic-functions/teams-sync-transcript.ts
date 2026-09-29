import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  type LogicFunctionExecutionContext,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_SYNC_TRANSCRIPT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';
import { syncTeamsTranscriptToCallRecordingOrThrow } from 'src/features/transcripts/logic-functions/utils/sync-teams-transcript-to-call-recording-or-throw';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

const teamsSyncTranscriptInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    meetingId: {
      type: 'string',
      label: 'Meeting ID',
      description: 'The meetingId returned by List My Teams Transcripts.',
    },
    transcriptId: {
      type: 'string',
      label: 'Transcript ID',
      description: 'The transcriptId returned by List My Teams Transcripts.',
    },
  },
  required: ['meetingId', 'transcriptId'],
  additionalProperties: false,
};

type TeamsSyncTranscriptResult =
  | {
      success: true;
      callRecordingId: string;
      created: boolean;
      skipped: boolean;
    }
  | { success: false; error: string };

export const teamsSyncTranscriptHandler = async (
  parameters: {
    meetingId?: unknown;
    transcriptId?: unknown;
  },
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<TeamsSyncTranscriptResult> => {
  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return { success: false, error: 'Teams transcripts are not enabled.' };
  }

  const { meetingId, transcriptId } = parameters;

  if (!isNonEmptyString(meetingId) || !isNonEmptyString(transcriptId)) {
    return {
      success: false,
      error: 'meetingId and transcriptId are required.',
    };
  }

  try {
    const connection = await getTeamsConnectionForRequestOrThrow(context);
    const result = await syncTeamsTranscriptToCallRecordingOrThrow({
      accessToken: connection.accessToken,
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      meetingId,
      transcriptId,
    });

    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_SYNC_TRANSCRIPT_UNIVERSAL_IDENTIFIER,
  name: 'teams-sync-transcript',
  description:
    'Sync one Teams meeting transcript from your connected Microsoft account into a Call Recording. Takes the meetingId and transcriptId returned by List My Teams Transcripts, and leaves recordings deleted in Twenty deleted.',
  timeoutSeconds: 300,
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
          created: { type: 'boolean' },
          skipped: { type: 'boolean' },
        },
      },
    ],
  },
});
