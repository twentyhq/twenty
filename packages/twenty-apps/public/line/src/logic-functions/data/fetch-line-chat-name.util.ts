import { isObject, isString } from '@sniptt/guards';

import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';
import { type LineSource } from 'src/logic-functions/types/line-webhook.type';

const GROUP_UNAVAILABLE_STATUS = 404;

const isGroupSummary = (body: unknown): body is { groupName: string } =>
  isObject(body) && 'groupName' in body && isString(body.groupName);

// only group chats have a name; one-on-one and multi-person chats take their title from participants
export const fetchLineChatName = async ({
  accessToken,
  source,
}: {
  accessToken: string;
  source: LineSource;
}): Promise<string | undefined> => {
  if (source.type !== 'group') {
    return undefined;
  }

  try {
    const { groupName } = await lineApiRequest({
      accessToken,
      method: 'GET',
      path: `/v2/bot/group/${encodeURIComponent(source.groupId)}/summary`,
      isExpectedResponse: isGroupSummary,
    });

    return groupName;
  } catch (error) {
    if (
      error instanceof LineApiError &&
      error.status === GROUP_UNAVAILABLE_STATUS
    ) {
      return undefined;
    }

    throw error;
  }
};
