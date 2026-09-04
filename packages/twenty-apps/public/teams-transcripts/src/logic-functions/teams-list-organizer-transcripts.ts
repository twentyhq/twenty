import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';

import { TEAMS_LIST_ORGANIZER_TRANSCRIPTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getGraphAccessToken } from 'src/logic-functions/utils/get-graph-access-token.util';
import { listOrganizerTranscripts } from 'src/logic-functions/utils/list-organizer-transcripts.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const teamsListOrganizerTranscriptsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    organizerUserId: {
      type: 'string',
      label: 'Organizer user ID',
      description:
        'Microsoft Entra object ID of the user whose organized meetings are listed.',
    },
    startDateTime: {
      type: 'string',
      label: 'Start (ISO 8601, UTC)',
      description: 'Only transcripts created after this instant.',
    },
    endDateTime: {
      type: 'string',
      label: 'End (ISO 8601, UTC)',
      description: 'Only transcripts created before this instant.',
    },
  },
  required: ['organizerUserId'],
  additionalProperties: false,
};

type ListedTranscript = {
  transcriptId: string;
  meetingId: string | null;
  createdDateTime: string | null;
};

type TeamsListOrganizerTranscriptsResult =
  | {
      success: true;
      organizerUserId: string;
      transcripts: ListedTranscript[];
      isTruncated: boolean;
    }
  | { success: false; error: string };

export const teamsListOrganizerTranscriptsHandler = async (parameters: {
  organizerUserId?: unknown;
  startDateTime?: unknown;
  endDateTime?: unknown;
}): Promise<TeamsListOrganizerTranscriptsResult> => {
  const { organizerUserId, startDateTime, endDateTime } = parameters;

  if (!isNonEmptyString(organizerUserId)) {
    return { success: false, error: 'organizerUserId is required' };
  }

  try {
    const listResult = await listOrganizerTranscripts({
      accessToken: await getGraphAccessToken(),
      organizerUserId,
      ...(isNonEmptyString(startDateTime) ? { startDateTime } : {}),
      ...(isNonEmptyString(endDateTime) ? { endDateTime } : {}),
    });

    return {
      success: true,
      organizerUserId,
      transcripts: listResult.transcripts.map((transcript) => ({
        transcriptId: transcript.id,
        meetingId: transcript.meetingId,
        createdDateTime: transcript.createdDateTime,
      })),
      isTruncated: listResult.isTruncated,
    };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_LIST_ORGANIZER_TRANSCRIPTS_UNIVERSAL_IDENTIFIER,
  name: 'teams-list-organizer-transcripts',
  description:
    'List the Microsoft Teams meeting transcripts available in Microsoft Graph for meetings organized by one user, optionally within a date window. Pair with Sync Teams Transcript to import them.',
  timeoutSeconds: 120,
  handler: teamsListOrganizerTranscriptsHandler,
  toolTriggerSettings: {
    inputSchema: teamsListOrganizerTranscriptsInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List Teams Transcripts By Organizer',
    inputSchema: jsonSchemaToInputSchema(
      teamsListOrganizerTranscriptsInputSchema,
    ),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          organizerUserId: { type: 'string' },
          isTruncated: { type: 'boolean' },
          transcripts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transcriptId: { type: 'string' },
                meetingId: { type: 'string' },
                createdDateTime: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  },
});
