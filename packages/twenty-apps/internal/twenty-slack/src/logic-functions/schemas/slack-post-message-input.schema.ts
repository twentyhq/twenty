import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channel: {
      type: 'string',
      description:
        'Channel ID (C…) or private channel / DM ID to post in. Prefer channel IDs over names.',
    },
    text: {
      type: 'string',
      description:
        'Message body. When mrkdwn is true, Slack mrkdwn formatting applies (bold, links, etc.).',
    },
    thread_ts: {
      type: 'string',
      description:
        'Optional parent message ts to reply in a thread (e.g. from a previous slack_post_message result).',
    },
    mrkdwn: {
      type: 'boolean',
      description:
        'When true, Slack parses mrkdwn in `text`. Defaults to false for plain text.',
    },
  },
  required: ['channel', 'text'],
  additionalProperties: false,
};
