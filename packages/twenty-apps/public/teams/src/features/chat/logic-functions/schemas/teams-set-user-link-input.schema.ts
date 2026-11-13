import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const teamsSetUserLinkInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    workspaceMemberId: {
      type: 'string',
      label: 'Workspace member ID',
      description:
        'Workspace member whose permissions the assistant borrows when this Teams user talks to it.',
    },
    teamsUserAadObjectId: {
      type: 'string',
      label: 'Microsoft Entra user ID',
      description:
        'Entra object id of the Teams account to link, as returned by the directory search.',
    },
    name: {
      type: 'string',
      label: 'Display name',
      description:
        'Teams display name to store on the link. Defaults to the Entra object id when omitted.',
    },
  },
  required: ['workspaceMemberId', 'teamsUserAadObjectId'],
  additionalProperties: false,
};
