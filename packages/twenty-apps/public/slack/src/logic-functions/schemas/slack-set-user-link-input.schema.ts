import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackSetUserLinkInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    workspaceMemberId: {
      type: 'string',
      label: 'Workspace member ID',
      description:
        'Workspace member whose permissions the assistant borrows when this Slack user talks to it.',
    },
    email: {
      type: 'string',
      label: 'Slack email',
      description:
        'Email of the Slack account to link. Resolved to a Slack user in the installed workspace. Use slackUserId instead for guests or Slack Connect users from another workspace.',
    },
    slackUserId: {
      type: 'string',
      label: 'Slack user ID',
      description:
        'Slack account to link (Slack member ID like U…). Provide this instead of email for guests or Slack Connect users; it takes precedence over email when both are given.',
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
        'Slack display name to store on the link. Defaults to the resolved Slack name or the Slack user ID.',
    },
  },
  required: ['workspaceMemberId'],
  additionalProperties: false,
};
