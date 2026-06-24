import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';

import { FIREFLIES_SYNC_CALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesSyncCallHandler } from 'src/logic-functions/handlers/fireflies-sync-call-handler';
import { firefliesSyncCallInputSchema } from 'src/logic-functions/schemas/fireflies-sync-call-input.schema';

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_SYNC_CALL_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-sync-call',
  description:
    'Sync a single Fireflies call onto its matching CalendarEvent on demand: fetches both transcript and AI summary from Fireflies and writes them to the Transcript and Summary fields. Same matching rules as the webhook (Fireflies calendar_id / cal_id ↔ Twenty eventExternalId or iCalUid). Useful for backfilling history, recovering from a missed webhook, or syncing on a workflow trigger instead of waiting for Fireflies to push.',
  timeoutSeconds: 60,
  toolTriggerSettings: {
    inputSchema: firefliesSyncCallInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Sync Fireflies Call',
    inputSchema: jsonSchemaToInputSchema(firefliesSyncCallInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
          transcriptId: { type: 'string' },
          calendarEventId: { type: 'string' },
          updatedFields: { type: 'array', items: { type: 'string' } },
          fieldOutcomes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                status: { type: 'string' },
                reason: { type: 'string' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  },
  handler: firefliesSyncCallHandler,
});
