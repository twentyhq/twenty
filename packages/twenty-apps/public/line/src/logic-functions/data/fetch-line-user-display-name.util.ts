import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';

const PROFILE_UNAVAILABLE_STATUS = 404;

// LINE answers 404 when the user blocked the account, is not a friend, or never consented to share their profile
export const fetchLineUserDisplayName = async ({
  accessToken,
  userId,
}: {
  accessToken: string;
  userId: string;
}): Promise<string | undefined> => {
  try {
    const { displayName } = await lineApiRequest<{ displayName: string }>({
      accessToken,
      method: 'GET',
      path: `/v2/bot/profile/${encodeURIComponent(userId)}`,
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
