import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';

import { FIREFLIES_LIST_CALLS_BY_PARTICIPANT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesListCallsByParticipantHandler } from 'src/logic-functions/handlers/fireflies-list-calls-by-participant-handler';
import { firefliesListCallsByParticipantInputSchema } from 'src/logic-functions/schemas/fireflies-list-calls-by-participant-input.schema';

const callSummaryProperties = {
  id: { type: 'string' },
  title: { type: 'string' },
  date: { type: 'string' },
  durationMinutes: { type: 'number' },
  participants: { type: 'array', items: { type: 'string' } },
  hostEmail: { type: 'string' },
  transcriptUrl: { type: 'string' },
  meetingLink: { type: 'string' },
} as const;

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_LIST_CALLS_BY_PARTICIPANT_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-list-calls-by-participant',
  description:
    'List Fireflies calls that include a given participant email. Returns each call\'s ID, title, date, duration, participants, host, Fireflies transcript URL, and original meeting link. Use this to answer "what calls have we had with this contact?" — for example as the first step of a workflow triggered when a Person record is created.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: firefliesListCallsByParticipantInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List Fireflies Calls By Participant',
    inputSchema: jsonSchemaToInputSchema(
      firefliesListCallsByParticipantInputSchema,
    ),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
          count: { type: 'number' },
          calls: {
            type: 'array',
            items: {
              type: 'object',
              properties: callSummaryProperties,
            },
          },
        },
      },
    ],
  },
  handler: firefliesListCallsByParticipantHandler,
});
