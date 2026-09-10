import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const firefliesSyncCallInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    transcriptId: {
      type: 'string',
      label: 'Fireflies call ID',
      description:
        'The ID of the Fireflies call to sync (also referred to as the "transcript ID" in Fireflies\' API and docs). Found at the end of the Fireflies meeting URL (`https://app.fireflies.ai/view/<id>`) or in the `meeting_id` field of a Fireflies webhook payload. Runs the same pipeline as the webhook: fetches transcript + AI summary from Fireflies and writes both onto the matching CalendarEvent.',
    },
  },
  required: ['transcriptId'],
  additionalProperties: false,
};
