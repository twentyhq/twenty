import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';
import {
  type InputJsonSchema,
  type LogicFunctionExecutionContext,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';

import { TEAMS_LIST_ORGANIZER_TRANSCRIPTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getMeetingByJoinUrl } from 'src/logic-functions/utils/get-meeting-by-join-url.util';
import { getTeamsConnectionForRequest } from 'src/logic-functions/utils/get-teams-connection-for-request.util';
import { listMeetingTranscripts } from 'src/logic-functions/utils/list-meeting-transcripts.util';
import { listTeamsCalendarPage } from 'src/logic-functions/utils/list-teams-calendar-page.util';
import { resolveTeamsMeetingWindow } from 'src/logic-functions/utils/resolve-teams-meeting-window.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const teamsListOrganizerTranscriptsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    startDateTime: {
      type: 'string',
      label: 'Start (ISO 8601, UTC)',
      description: 'Find meetings after this instant. Defaults to 31 days ago.',
    },
    endDateTime: {
      type: 'string',
      label: 'End (ISO 8601, UTC)',
      description: 'Find meetings before this instant. Defaults to now.',
    },
    nextPageUrl: {
      type: 'string',
      label: 'Next page URL',
      description:
        'Continue from nextPageUrl returned by a previous list call.',
    },
  },
  required: [],
  additionalProperties: false,
};

type ListedTranscript = {
  transcriptId: string;
  meetingId: string;
  subject?: string;
  createdDateTime?: string;
};

type TeamsListOrganizerTranscriptsResult =
  | {
      success: true;
      connectedAccount: string;
      transcripts: ListedTranscript[];
      isTruncated: boolean;
      nextPageUrl?: string;
    }
  | { success: false; error: string };

export const teamsListOrganizerTranscriptsHandler = async (
  parameters: {
    startDateTime?: unknown;
    endDateTime?: unknown;
    nextPageUrl?: unknown;
  },
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<TeamsListOrganizerTranscriptsResult> => {
  try {
    const window = resolveTeamsMeetingWindow(parameters);
    const connection = await getTeamsConnectionForRequest(context);
    const page = await listTeamsCalendarPage({
      accessToken: connection.accessToken,
      window,
      ...(isNonEmptyString(parameters.nextPageUrl)
        ? { nextPageUrl: parameters.nextPageUrl }
        : {}),
    });
    const transcripts: ListedTranscript[] = [];

    for (const joinWebUrl of page.joinWebUrls) {
      const meeting = await getMeetingByJoinUrl({
        accessToken: connection.accessToken,
        joinWebUrl,
      });

      if (!isDefined(meeting)) {
        continue;
      }

      const meetingTranscripts = await listMeetingTranscripts({
        accessToken: connection.accessToken,
        meetingId: meeting.id,
      });

      transcripts.push(
        ...meetingTranscripts.map((transcript) => ({
          transcriptId: transcript.id,
          meetingId: transcript.meetingId,
          ...(isNonEmptyString(meeting.subject)
            ? { subject: meeting.subject }
            : {}),
          ...(isNonEmptyString(transcript.createdDateTime)
            ? { createdDateTime: transcript.createdDateTime }
            : {}),
        })),
      );
    }

    return {
      success: true,
      connectedAccount: connection.handle,
      transcripts,
      isTruncated: isNonEmptyString(page.nextPageUrl),
      ...(isNonEmptyString(page.nextPageUrl)
        ? { nextPageUrl: page.nextPageUrl }
        : {}),
    };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_LIST_ORGANIZER_TRANSCRIPTS_UNIVERSAL_IDENTIFIER,
  name: 'teams-list-organizer-transcripts',
  description:
    'List transcripts for scheduled Teams meetings organized by your connected Microsoft account. Returns one calendar page at a time, with nextPageUrl for continuation.',
  timeoutSeconds: 300,
  handler: teamsListOrganizerTranscriptsHandler,
  toolTriggerSettings: {
    inputSchema: teamsListOrganizerTranscriptsInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List My Teams Transcripts',
    inputSchema: jsonSchemaToInputSchema(
      teamsListOrganizerTranscriptsInputSchema,
    ),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          connectedAccount: { type: 'string' },
          nextPageUrl: { type: 'string' },
          isTruncated: { type: 'boolean' },
          transcripts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transcriptId: { type: 'string' },
                meetingId: { type: 'string' },
                subject: { type: 'string' },
                createdDateTime: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  },
});
