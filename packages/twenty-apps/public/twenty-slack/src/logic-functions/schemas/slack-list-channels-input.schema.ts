import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackListChannelsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channelType: {
      type: 'string',
      label: 'Channel type',
      enum: ['Public', 'Private', 'All'],
      description:
        'Optional. Which kinds of channels to include. `All` returns both public and private channels. Default: `All`.',
    },
    excludeArchived: {
      type: 'boolean',
      label: 'Exclude archived',
      description:
        'Optional. Hide archived channels from the list. Default: `true`.',
    },
    limit: {
      type: 'integer',
      label: 'Max results',
      minimum: 1,
      maximum: 1000,
      description:
        'Optional. Cap the total number of channels returned across pagination. Default: `200`. Max: `1000`. Larger workspaces may not be fully covered within the function timeout.',
    },
  },
  additionalProperties: false,
};
