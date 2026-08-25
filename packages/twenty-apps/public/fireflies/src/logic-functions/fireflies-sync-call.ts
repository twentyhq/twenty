import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';

import { FIREFLIES_SYNC_CALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesSyncCallHandler } from 'src/logic-functions/handlers/fireflies-sync-call-handler';
import { firefliesSyncCallInputSchema } from 'src/logic-functions/schemas/fireflies-sync-call-input.schema';

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_SYNC_CALL_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-sync-call',
  description:
    'Sync a single Fireflies call into a CallRecording record on demand: searches the connected Fireflies accounts for the transcript, fetches its transcript and AI summary, and upserts them onto one CallRecording linked to the matching CalendarEvent.',
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
          callRecordingId: { type: 'string' },
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
