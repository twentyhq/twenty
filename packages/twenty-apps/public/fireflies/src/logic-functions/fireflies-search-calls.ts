import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';

import { FIREFLIES_SEARCH_CALLS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesSearchCallsHandler } from 'src/logic-functions/handlers/fireflies-search-calls-handler';
import { firefliesSearchCallsInputSchema } from 'src/logic-functions/schemas/fireflies-search-calls-input.schema';

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
  universalIdentifier: FIREFLIES_SEARCH_CALLS_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-search-calls',
  description:
    'Search Fireflies calls by keyword. Matches the keyword against both meeting titles and the words spoken during meetings (full transcript content). Returns each match\'s ID, title, date, duration, participants, host, Fireflies transcript URL, and meeting link. Use this for AI-chat questions like "find any call where we discussed pricing".',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: firefliesSearchCallsInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Search Fireflies Calls',
    inputSchema: jsonSchemaToInputSchema(firefliesSearchCallsInputSchema),
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
  handler: firefliesSearchCallsHandler,
});
