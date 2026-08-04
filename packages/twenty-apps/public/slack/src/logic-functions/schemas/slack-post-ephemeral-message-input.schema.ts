import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostEphemeralMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackChannelId: {
      type: 'string',
      label: 'Slack channel (name or ID)',
      description:
        'Channel where the note appears (Slack channel ID like C…). The person you choose must already be in this channel, or they will not see the message.',
    },
    recipientSlackUserId: {
      type: 'string',
      label: 'Recipient (Slack user ID)',
      description:
        'Who can see this message: their Slack **member ID** (starts with U…). Only that person sees it; everyone else in the channel does not. In Slack: click their profile → three dots → Copy member ID (wording may vary by client).',
    },
    messageText: {
      type: 'string',
      label: 'Message',
      multiline: true,
      description:
        'Short note shown only to the recipient above — for example a private hint, validation result, or next step.',
    },
    messageFormat: {
      type: 'string',
      label: 'Message format',
      enum: ['plain', 'markdown'],
      description:
        'Optional. Same as **Send Slack Message**: `markdown` / `plain` / omit — see that action’s `messageFormat` description.',
    },
  },
  required: ['slackChannelId', 'recipientSlackUserId', 'messageText'],
  additionalProperties: false,
};
