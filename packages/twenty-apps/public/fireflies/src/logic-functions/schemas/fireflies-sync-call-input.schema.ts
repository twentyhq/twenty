import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const firefliesSyncCallInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    transcriptId: {
      type: 'string',
      label: 'Fireflies call ID',
      description:
        'The ID of the Fireflies call to sync (also referred to as the "transcript ID" in Fireflies\' API and docs). Found at the end of the Fireflies meeting URL (`https://app.fireflies.ai/view/<id>`). Searches every connected Fireflies account, then writes the transcript and AI summary onto a CallRecording linked to the matching CalendarEvent.',
    },
  },
  required: ['transcriptId'],
  additionalProperties: false,
};
