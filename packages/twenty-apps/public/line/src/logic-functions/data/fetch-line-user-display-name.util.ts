import { isObject, isString } from '@sniptt/guards';

import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';
import { type LineSource } from 'src/logic-functions/types/line-webhook.type';

const PROFILE_UNAVAILABLE_STATUS = 404;

const isProfile = (body: unknown): body is { displayName: string } =>
  isObject(body) && 'displayName' in body && isString(body.displayName);

// a group member's profile is readable even when they are not a friend of the account
const buildProfilePath = (source: LineSource, userId: string) => {
  const encodedUserId = encodeURIComponent(userId);

  switch (source.type) {
    case 'user':
      return `/v2/bot/profile/${encodedUserId}`;
    case 'group':
      return `/v2/bot/group/${encodeURIComponent(source.groupId)}/member/${encodedUserId}`;
    case 'room':
      return `/v2/bot/room/${encodeURIComponent(source.roomId)}/member/${encodedUserId}`;
  }
};

// LINE answers 404 when the user blocked the account, left the chat, or never consented to share their profile
export const fetchLineUserDisplayName = async ({
  accessToken,
  source,
  userId,
}: {
  accessToken: string;
  source: LineSource;
  userId: string;
}): Promise<string | undefined> => {
  try {
    const { displayName } = await lineApiRequest({
      accessToken,
      method: 'GET',
      path: buildProfilePath(source, userId),
      isExpectedResponse: isProfile,
    });

    return displayName;
  } catch (error) {
    if (
      error instanceof LineApiError &&
      error.status === PROFILE_UNAVAILABLE_STATUS
    ) {
      return undefined;
    }

    throw error;
  }
};
