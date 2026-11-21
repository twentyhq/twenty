import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';
import { type LineSource } from 'src/logic-functions/types/line-webhook.type';

const GROUP_UNAVAILABLE_STATUS = 404;

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
    const { groupName } = await lineApiRequest<{ groupName: string }>({
      accessToken,
      method: 'GET',
      path: `/v2/bot/group/${encodeURIComponent(source.groupId)}/summary`,
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
