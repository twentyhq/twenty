import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostEphemeralMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slack_channel_id: {
      type: 'string',
      description:
        'Channel where the note appears (Slack channel ID like C…). The person you choose must already be in this channel, or they will not see the message.',
    },
    recipient_slack_user_id: {
      type: 'string',
      description:
        'Who can see this message: their Slack **member ID** (starts with U…). Only that person sees it; everyone else in the channel does not. In Slack: click their profile → three dots → Copy member ID (wording may vary by client).',
    },
    message_text: {
      type: 'string',
      description:
        'Short note shown only to the recipient above — for example a private hint, validation result, or next step.',
    },
    use_slack_markdown: {
      type: 'boolean',
      description:
        'Optional. Use Slack’s simple formatting (*bold*, links, etc.) in the message text.',
    },
  },
  required: ['slack_channel_id', 'recipient_slack_user_id', 'message_text'],
  additionalProperties: false,
};
