import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const firefliesSearchCallsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    keyword: {
      type: 'string',
      label: 'Keyword to search for',
      description:
        'Keyword or phrase to search across Fireflies meetings. Matches against both meeting titles and the words spoken during meetings. Useful for finding "the call where we discussed pricing" or "any meeting that mentioned the new integration".',
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
  required: ['keyword'],
  additionalProperties: false,
};
