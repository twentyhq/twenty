import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackChannelId: {
      type: 'string',
      label: 'Slack channel (name or ID)',
      description:
        'Where to post: the Slack channel or DM ID (looks like C0123…, G… for private channels, or D… for DMs). In Slack: open the channel → channel name → scroll down → copy Channel ID. Using the ID is more reliable than a channel name.',
    },
    messageText: {
      type: 'string',
      label: 'Message',
      multiline: true,
      description:
        'The message people will read in Slack. Keep it concise; very long messages may be rejected by Slack.',
    },
    parentMessageTimestamp: {
      type: 'string',
      label: 'Parent message timestamp',
      description:
        'Optional. Only when you want a **thread reply**: paste the **Message timestamp** from an earlier Slack step (the value returned as `slackTs` after posting). Leave empty for a normal new message at the bottom of the channel.',
    },
    messageFormat: {
      type: 'string',
      label: 'Message format',
      enum: ['plain', 'markdown'],
      description:
        'Optional. `markdown`: send as Slack `markdown_text` so usual Markdown in `messageText` works (**bold**, lists, fenced code). `plain`: send as `text` with `mrkdwn: false` (no markup). Omit: send as `text` and let Slack use its default (legacy mrkdwn may still apply in `text`).',
    },
  },
  required: ['slackChannelId', 'messageText'],
  additionalProperties: false,
};
