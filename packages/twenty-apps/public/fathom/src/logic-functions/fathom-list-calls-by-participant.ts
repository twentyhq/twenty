import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { FATHOM_LIST_CALLS_BY_PARTICIPANT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomCallSummary } from 'src/logic-functions/types/fathom-call-summary.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { doesFathomMeetingIncludeInvitee } from 'src/logic-functions/utils/does-fathom-meeting-include-invitee.util';
import { listFathomConnectionsForRequest } from 'src/logic-functions/utils/list-fathom-connections-for-request.util';
import { listFathomMeetings } from 'src/logic-functions/utils/list-fathom-meetings.util';
import { mapFathomMeetingToCallSummary } from 'src/logic-functions/utils/map-fathom-meeting-to-call-summary.util';

const DEFAULT_RESULT_LIMIT = 10;
const MAXIMUM_RESULT_LIMIT = 50;

const fathomListCallsByParticipantInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    participantEmail: {
      type: 'string',
      label: 'Participant email',
      description:
        'Email address of a calendar invitee. Returns the Fathom recordings whose invitees include this email, most recent first.',
    },
    limit: {
      type: 'integer',
      label: 'Maximum number of calls',
      description: `Optional. Defaults to ${DEFAULT_RESULT_LIMIT}, capped at ${MAXIMUM_RESULT_LIMIT}.`,
      minimum: 1,
      maximum: MAXIMUM_RESULT_LIMIT,
    },
  },
  required: ['participantEmail'],
  additionalProperties: false,
};

type FathomListCallsByParticipantResult =
  | { success: true; count: number; calls: FathomCallSummary[] }
  | { success: false; error: string };

const clampLimit = (limit: unknown): number =>
  typeof limit === 'number' && Number.isFinite(limit)
    ? Math.max(1, Math.min(MAXIMUM_RESULT_LIMIT, Math.trunc(limit)))
    : DEFAULT_RESULT_LIMIT;

export const fathomListCallsByParticipantHandler = async (
  parameters: { participantEmail?: unknown; limit?: unknown },
  context: LogicFunctionExecutionContext,
): Promise<FathomListCallsByParticipantResult> => {
  const participantEmail =
    typeof parameters.participantEmail === 'string'
      ? parameters.participantEmail.trim().toLowerCase()
      : '';

  if (!isNonEmptyString(participantEmail)) {
    return { success: false, error: 'participantEmail is required' };
  }

  const limit = clampLimit(parameters.limit);
  const connections = await listFathomConnectionsForRequest(context);

  if (connections.length === 0) {
    return {
      success: false,
      error:
        'Fathom is not connected for this user. Open the Fathom app settings and add a connection first.',
    };
  }

  const hasParticipant = (meeting: Meeting): boolean =>
    doesFathomMeetingIncludeInvitee({
      meeting,
      normalizedInviteeEmail: participantEmail,
    });
  const matchingMeetingsByRecordingId = new Map<number, Meeting>();

  for (const connection of connections) {
    const meetings = await listFathomMeetings({
      fathomClient: createFathomClient(connection.accessToken),
      stopWhen: (listedMeetings) =>
        listedMeetings.filter(hasParticipant).length >= limit,
    });

    for (const meeting of meetings.filter(hasParticipant)) {
      matchingMeetingsByRecordingId.set(meeting.recordingId, meeting);
    }
  }

  const calls = [...matchingMeetingsByRecordingId.values()]
    .sort(
      (firstMeeting, secondMeeting) =>
        secondMeeting.recordingStartTime.getTime() -
        firstMeeting.recordingStartTime.getTime(),
    )
    .slice(0, limit)
    .map(mapFathomMeetingToCallSummary);

  return { success: true, count: calls.length, calls };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_LIST_CALLS_BY_PARTICIPANT_UNIVERSAL_IDENTIFIER,
  name: 'fathom-list-calls-by-participant',
  description:
    'List accessible Fathom recordings whose calendar invitees include a given email. Returns each recording ID, title, start time, duration, participants, recorder, Fathom URL and meeting URL. Use the recordingId with Sync Fathom Call.',
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
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          count: { type: 'number' },
          calls: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                recordingId: { type: 'number' },
                title: { type: 'string' },
                startedAt: { type: 'string' },
                durationMinutes: { type: 'number' },
                participants: { type: 'array', items: { type: 'string' } },
                recordedBy: { type: 'string' },
                fathomUrl: { type: 'string' },
                meetingUrl: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  },
});
