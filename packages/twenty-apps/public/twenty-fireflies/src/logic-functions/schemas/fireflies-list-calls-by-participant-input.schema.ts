import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const firefliesListCallsByParticipantInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    participantEmail: {
      type: 'string',
      label: 'Participant email',
      description:
        'Email address of a meeting attendee. Returns Fireflies calls where this email appears in the participants list (case-insensitive match performed by Fireflies). Useful to answer "what calls have we had with this contact?" before reaching out to them.',
    },
    limit: {
      type: 'integer',
      label: 'Maximum number of calls',
      description:
        'Optional. Maximum number of calls to return. Defaults to 20. Fireflies caps the limit at 50 per query.',
      minimum: 1,
      maximum: 50,
    },
  },
  required: ['participantEmail'],
  additionalProperties: false,
};
