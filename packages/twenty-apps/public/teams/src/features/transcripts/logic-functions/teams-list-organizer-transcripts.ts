import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  type LogicFunctionExecutionContext,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_LIST_ORGANIZER_TRANSCRIPTS_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { buildTeamsCalendarViewUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-calendar-view-url';
import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';
import { listTeamsCalendarPage } from 'src/features/transcripts/logic-functions/utils/list-teams-calendar-page';
import { listTeamsOccurrenceTranscripts } from 'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts';
import { resolveTeamsCalendarNextPageUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-teams-calendar-next-page-url-or-throw';
import { resolveTeamsMeetingWindowOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-teams-meeting-window-or-throw';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

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
  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return { success: false, error: 'Teams transcripts are not enabled.' };
  }

  try {
    const calendarPageUrl = isNonEmptyString(parameters.nextPageUrl)
      ? resolveTeamsCalendarNextPageUrlOrThrow(parameters.nextPageUrl)
      : buildTeamsCalendarViewUrl(resolveTeamsMeetingWindowOrThrow(parameters));
    const connection = await getTeamsConnectionForRequestOrThrow(context);
    const page = await listTeamsCalendarPage({
      accessToken: connection.accessToken,
      url: calendarPageUrl,
    });
    const transcripts = await listTeamsOccurrenceTranscripts({
      accessToken: connection.accessToken,
      occurrences: page.occurrences,
    });

    return {
      success: true,
      connectedAccount: connection.handle,
      transcripts: transcripts.map(
        ({ meeting, transcript }): ListedTranscript => ({
          transcriptId: transcript.id,
          meetingId: meeting.id,
          subject: isNonEmptyString(meeting.subject)
            ? meeting.subject
            : undefined,
          createdDateTime: isNonEmptyString(transcript.createdDateTime)
            ? transcript.createdDateTime
            : undefined,
        }),
      ),
      nextPageUrl: page.nextPageUrl,
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
