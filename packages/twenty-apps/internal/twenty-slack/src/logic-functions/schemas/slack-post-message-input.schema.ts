import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackChannelId: {
      type: 'string',
      description:
        'Where to post: the Slack channel or DM ID (looks like C0123…, G… for private channels, or D… for DMs). In Slack: open the channel → channel name → scroll down → copy Channel ID. Using the ID is more reliable than a channel name.',
    },
    messageText: {
      type: 'string',
      description:
        'The message people will read in Slack. Keep it concise; very long messages may be rejected by Slack.',
    },
    parentMessageTimestamp: {
      type: 'string',
      description:
        'Optional. Only when you want a **thread reply**: paste the **Message timestamp** from an earlier Slack step (the value returned as `slackTs` after posting). Leave empty for a normal new message at the bottom of the channel.',
    },
    useSlackMarkdown: {
      type: 'boolean',
      description:
        'Optional. Turn on Slack’s lightweight formatting in `messageText` (*bold*, _italic_, <https://…|links>, etc.). Leave off for plain text.',
    },
  },
  required: ['slackChannelId', 'messageText'],
  additionalProperties: false,
};
