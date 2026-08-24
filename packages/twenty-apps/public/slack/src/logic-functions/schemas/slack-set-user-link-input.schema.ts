import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackSetUserLinkInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackUserId: {
      type: 'string',
      label: 'Slack user ID',
      description: 'Slack account to link (Slack member ID like U…).',
    },
    workspaceMemberId: {
      type: 'string',
      label: 'Workspace member ID',
      description:
        'Workspace member whose permissions the assistant borrows when this Slack user talks to it.',
    },
    slackTeamId: {
      type: 'string',
      label: 'Slack team ID',
      description:
        'Slack workspace the account belongs to. Defaults to the installed Slack workspace; set it when linking a Slack Connect user whose messages carry another team ID.',
    },
    name: {
      type: 'string',
      label: 'Display name',
      description:
        'Slack display name to store on the link. Defaults to the Slack user ID.',
    },
  },
  required: ['slackUserId', 'workspaceMemberId'],
  additionalProperties: false,
};
