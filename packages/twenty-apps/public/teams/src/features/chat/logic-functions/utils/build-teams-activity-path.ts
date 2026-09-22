import { isDefined } from 'twenty-sdk/utils';

export const buildTeamsActivityPath = ({
  conversationId,
  activityId,
}: {
  conversationId: string;
  activityId?: string;
}): string =>
  `/v3/conversations/${encodeURIComponent(conversationId)}/activities${
    isDefined(activityId) ? `/${encodeURIComponent(activityId)}` : ''
  }`;
