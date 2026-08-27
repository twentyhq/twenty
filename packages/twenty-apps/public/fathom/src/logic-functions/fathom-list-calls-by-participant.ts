import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { FATHOM_LIST_CALLS_BY_PARTICIPANT_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-list-calls-by-participant-universal-identifier';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { getFathomConnectionForRequest } from 'src/logic-functions/utils/get-fathom-connection-for-request.util';
import { listAccessibleFathomMeetings } from 'src/logic-functions/utils/list-accessible-fathom-meetings.util';

const DEFAULT_RESULT_LIMIT = 10;
const MAXIMUM_RESULT_LIMIT = 50;

const fathomListCallsByParticipantInputSchema = {
  type: 'object',
  properties: {
    participantEmail: {
      type: 'string',
      label: 'Participant email',
      description: 'Exact calendar invitee email to match.',
    },
    limit: {
      type: 'number',
      label: 'Maximum results',
      description: 'Between 1 and 50. Defaults to 10.',
    },
  },
  required: ['participantEmail'],
} as const satisfies InputJsonSchema;

export const fathomListCallsByParticipantHandler = async (
  parameters: { participantEmail: string; limit?: number },
  context: LogicFunctionExecutionContext,
) => {
  const participantEmail = parameters.participantEmail.trim().toLowerCase();

  if (!isNonEmptyString(participantEmail)) {
    return { success: false, error: 'participantEmail is required' };
  }

  const limit = Math.min(
    MAXIMUM_RESULT_LIMIT,
    Math.max(1, Math.floor(parameters.limit ?? DEFAULT_RESULT_LIMIT)),
  );
  const connection = await getFathomConnectionForRequest(context);
  const matchingMeetings = await listAccessibleFathomMeetings({
    fathomClient: createFathomClient(connection.accessToken),
    stopWhen: (meetings) =>
      meetings.filter((meeting) =>
        meeting.calendarInvitees.some(
          (invitee) => invitee.email?.toLowerCase() === participantEmail,
        ),
      ).length >= limit,
  });
  const calls = matchingMeetings
    .filter((meeting) =>
      meeting.calendarInvitees.some(
        (invitee) => invitee.email?.toLowerCase() === participantEmail,
      ),
    )
    .slice(0, limit)
    .map((meeting) => ({
      recordingId: meeting.recordingId,
      title: meeting.meetingTitle ?? meeting.title,
      startedAt: meeting.recordingStartTime.toISOString(),
      durationMinutes:
        (meeting.recordingEndTime.getTime() -
          meeting.recordingStartTime.getTime()) /
        60_000,
      participants: meeting.calendarInvitees
        .map((invitee) => invitee.email)
        .filter(isNonEmptyString),
      recordedBy: meeting.recordedBy.email,
      fathomUrl: meeting.url,
      meetingUrl: meeting.meetingUrl ?? '',
    }));

  return { success: true, count: calls.length, calls };
};

export default defineLogicFunction({
  universalIdentifier:
    FATHOM_LIST_CALLS_BY_PARTICIPANT_UNIVERSAL_IDENTIFIER,
  name: 'fathom-list-calls-by-participant',
  description:
    'List accessible Fathom recordings containing an exact calendar invitee email. Use the returned recordingId with Sync Fathom Call.',
  timeoutSeconds: 30,
  handler: fathomListCallsByParticipantHandler,
  toolTriggerSettings: {
    inputSchema: fathomListCallsByParticipantInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List Fathom Calls By Participant',
    inputSchema: jsonSchemaToInputSchema(
      fathomListCallsByParticipantInputSchema,
    ),
  },
});
